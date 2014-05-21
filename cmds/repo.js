/* repo commander component
 * To use add require('../cmds/repo.js')(program) to your commander.js based node executable before program.parse
 */
'use strict';

var request = require("superagent");
var fs = require('fs');
var path = require('path');
var open = require('open');

var config;

if (fs.existsSync(path.join(__dirname, '../config.json'))) {
  config = require('../config.json');
} else {
  console.log('You must set your GitHub token')
  console.log('Run the following command to create a config.json file, add your token, then try again.')
  console.log('cp ' + path.join(__dirname, '../config.json.example') + ' ' + path.join(__dirname, '../config.json') + ' && vim ' + path.join(__dirname, '../config.json'))
  process.exit();
}

module.exports = function(program) {

  program
    .command("rc <fullname>")
    .version("0.0.1")
    .description("Create repo on GitHub")
    // create repo
    .action(function(fullname) {
      var owner = fullname.split("/")[0];
      var repo = fullname.split("/")[1];
      var repoData = {
        name: repo,
        private: true,
        has_issues: false,
        has_wiki: false,
        auto_init: false
      };

      // first try to create as org
      request
        .post("https://api.github.com/orgs/" + owner + "/repos")
        .query({access_token: config.github.token})
        .set('Content-Type', 'application/json')
        .send(repoData)
        .end(function(res) {
          if(res.ok) {
            console.log("url: " + res.body.html_url);

            // set webhook (only on org)
            request
              .post("https://api.github.com/repos/" + owner + "/" + repo + "/hooks")
              .query({access_token: config.github.token})
              .set('Content-Type', 'application/json')
              .send(config.github.webhook)
              .end(function(res) {
                if(res.ok) {
                  console.log("webhook set");
                } else {
                  console.log(res.body);
                }
              });
            console.log("opening url in browser...");
            open(res.body.html_url);
          } else if (res.notFound) {

            // if creating as an org fails, try as user
            request
              .post("https://api.github.com/user/repos")
              .query({access_token: config.github.token})
              .set('Content-Type', 'application/json')
              .send(repoData)
              .end(function(res) {
                if(res.ok) {
                  console.log("url: " + res.body.html_url);
                  console.log("opening url in browser...");
                  open(res.body.html_url);
                } else {
                  console.log(res.body);
                }
              });
          }
        });
    });

  program
    .command("rd <fullname>")
    .version("0.0.1")
    .description("Destroy repo on GitHub")
    .action(function(fullname) {
      var org = fullname.split("/")[0];
      var repo = fullname.split("/")[1];

      request
        .del("https://api.github.com/repos/" + org + "/" + repo)
        .query({access_token: config.github.token})
        .set('Content-Type', 'application/json')
        .end(function(res) {
          if(res.ok) {
            console.log("...annnnd, it's gone.");
          } else {
            console.log(res.body);
          }
        });
    });

  program
    .command('rha <fullname>')
    .version('0.0.1')
    .description('Create a webhook on a repo')
    .action(function(fullname){
      var owner = fullname.split("/")[0];
      var repo = fullname.split("/")[1];

      request
        .post("https://api.github.com/repos/" + owner + "/" + repo + "/hooks")
        .query({access_token: config.github.token})
        .set('Content-Type', 'application/json')
        .send(config.github.webhook)
        .end(function(res) {
          if(res.ok) {
            var hookId = res.body.id;
            console.log("webhook set");
          } else {
            console.log(res.body);
          }
        });
    })

  program
    .command('rta <fullname>')
    .version('0.0.1')
    .description('Add all teams listed in config.json to an existing repo')
    .action(function(fullname){
      var owner = fullname.split("/")[0];
      var repo = fullname.split("/")[1];
      var addRepoToTeam = function(team) {
        request
          .put("https://api.github.com/teams/" + team.id + "/repos/" + owner + "/" + repo)
          .query({access_token: config.github.token})
          .set('Content-Type', 'application/json')
          .end(function(res) {
            if(res.ok) {
              var hookId = res.body.id;
              console.log(team.name + " granted access");
            } else {
              console.log(res.body);
            }
          });
      }
      for(var i = 0; i < config.github.teams.length; i++) {
        addRepoToTeam(config.github.teams[i]);
      }
    })

  program
    .command('tga <org>')
    .version('0.0.1')
    .description('Get the first 100 teams associated with an Org')
    .action(function(org){
      var owner = org;
      request
        .get("https://api.github.com/orgs/" + owner + "/teams")
        .query({access_token: config.github.token})
        .query({per_page: 100})
        .set('Content-Type', 'application/json')
        .end(function(res) {
          if(res.ok) {
            // TODO: accomodate paginated results. This will only report page 1 (with 100 results)
            var teamArray = res.body;
            var result = [];
            for(var i = 0; i < teamArray.length; i++){
              var teamObj = teamArray[i];
              var teamObjRedux = {};
              for (var prop in teamObj) {
                if (prop === "name") {
                  teamObjRedux[prop] = teamObj[prop];
                }
                if (prop === "id") {
                  teamObjRedux[prop] = teamObj[prop];
                }
              }
              result.push(teamObjRedux);
            }
            console.log(result);
          } else {
            console.log(res.body);
          }
        });
    });

  program
    .command('rga <org>')
    .version('0.0.1')
    .description('Get the first 100 repos associated with an Org')
    .action(function(org){
      var owner = org;
      request
        .get("https://api.github.com/orgs/" + owner + "/repos")
        .query({access_token: config.github.token})
        .query({per_page: 100})
        .set('Content-Type', 'application/json')
        .end(function(res) {
          if(res.ok) {
            // TODO: accomodate paginated results. This will only report page 1
            var repoArray = res.body;
            var result = [];
            for(var i = 0; i < repoArray.length; i++){
              var repoObj = repoArray[i];
              var repoObjRedux = {};
              for (var prop in repoObj) {
                if (prop === "name") {
                  repoObjRedux[prop] = repoObj[prop];
                }
                if (prop === "id") {
                  repoObjRedux[prop] = repoObj[prop];
                }
              }
              result.push(repoObjRedux);
            }
            console.log(result);
          } else {
            console.log(res.body);
          }
        });
    });

};
