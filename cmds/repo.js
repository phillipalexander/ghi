/* repo commander component
 * To use add require('../cmds/repo.js')(program) to your commander.js based node executable before program.parse
 */
'use strict';

var request = require("superagent");
var fs = require('fs');
var path = require('path');
var open = require('open');

var getTeamId = function getTeamId(teamName, orgName, callback) {
  request
    .get("https://api.github.com/orgs/" + orgName + "/teams")
    .query({access_token: program.config.github.token})
    .query({per_page: 100})
    .set('Content-Type', 'application/json')
    .end(function(res) {
      if(res.ok) {
        console.log("...got first 100 teams")
        // TODO: accomodate paginated results. This will only report page 1 (with 100 results)
        var teamArray = res.body;
        var teamId;
        for(var i = 0; i < teamArray.length; i++){
          var teamObj = teamArray[i];
          for (var prop in teamObj) {
            if (teamObj.hasOwnProperty("name") && teamObj.name === teamName) {
              teamId = teamObj.id;
              break;
            }
          }
        }
        callback.apply(this, [teamId]);
      } else {
        console.log(res.body)
      }
    });
}

var addTeamUser = function addTeamUser(teamId, userName, callback, args){
  request
    .put("https://api.github.com/teams/" + teamId + "/members/" + userName)
    .query({access_token: program.config.github.token})
    .set('Content-Type', 'application/json')
    .end(function(res) {
      if(res.ok) {
        console.log("user:" + userName + " has been added to team:" + teamId);
        // callback.apply(this, args)
      } else {
        console.log(res.body);
      }
    });
}

module.exports = function(program) {

  // Example Usage: ghi rc macroscope/blog
  program
    .command("rc <orgname\/reponame>")
    .version("0.0.2")
    .description("Repo Create: Create a repo on GitHub")
    // create repo
    .action(function(args) {
      var owner = args.split("/")[0];
      var repo = args.split("/")[1];
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
        .query({access_token: program.config.github.token})
        .set('Content-Type', 'application/json')
        .send(repoData)
        .end(function(res) {
          if(res.ok) {
            console.log("url: " + res.body.html_url);

            // set webhook (only on org)
            request
              .post("https://api.github.com/repos/" + owner + "/" + repo + "/hooks")
              .query({access_token: program.config.github.token})
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
              .query({access_token: program.config.github.token})
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

  // Example Usage: ghi rd macroscope/blog
  program
    .command("rd <orgname\/reponame>")
    .version("0.0.2")
    .description("Repo Destroy: Destroy a repo on GitHub")
    .action(function(args) {
      var org = args.split("/")[0];
      var repo = args.split("/")[1];

      request
        .del("https://api.github.com/repos/" + org + "/" + repo)
        .query({access_token: program.config.github.token})
        .set('Content-Type', 'application/json')
        .end(function(res) {
          if(res.ok) {
            console.log("...annnnd, it's gone.");
          } else {
            console.log(res.body);
          }
        });
    });

  // Example Usage: ghi rha macroscope/blog
  program
    .command('rha <orgname\/reponame>')
    .version('0.0.2')
    .description('Repo Hook Add: Add webhook defined in config.json to a repo')
    .action(function(args){
      var owner = args.split("/")[0];
      var repo = args.split("/")[1];

      request
        .post("https://api.github.com/repos/" + owner + "/" + repo + "/hooks")
        .query({access_token: program.config.github.token})
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

  // Example Usage: ghi rta macroscope/blog
  program
    .command('rta <orgname\/reponame>')
    .version('0.0.2')
    .description('Repo Team Add: Add all teams listed in config.json to an existing repo')
    .action(function(args){
      var owner = args.split("/")[0];
      var repo = args.split("/")[1];
      var addRepoToTeam = function(team) {
        request
          .put("https://api.github.com/teams/" + team.id + "/repos/" + owner + "/" + repo)
          .query({access_token: program.config.github.token})
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

  // Example Usage: ghi rga macroscope
  program
    .command('rga <orgname>')
    .version('0.0.2')
    .description('Repo Get All: Get the first 100 repos associated with an Org')
    .action(function(org){
      var owner = org;
      request
        .get("https://api.github.com/orgs/" + owner + "/repos")
        .query({access_token: program.config.github.token})
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

  // Example Usage: ghi tga macroscope
  program
    .command('tga <orgname>')
    .version('0.0.2')
    .description('Team Get All: Get the first 100 teams associated with an Org')
    .action(function(org){
      var owner = org;
      request
        .get("https://api.github.com/orgs/" + owner + "/teams")
        .query({access_token: program.config.github.token})
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

  // Example Usage: ghi tua -o "macroscope" -t "Team alexis" -u "alexanderphillip"
  program
    .command('tua')
    .description('Team User Add: Add a GitHub user to an existing team ')
    .option('-o, --org <orgname>', 'GitHub Org')
    .option('-t, --team <teamname>', 'GitHub Team')
    .option('-u, --user <username>', 'GitHub Username')
    .action(function(options){
      getTeamId(options.team, options.org, function(teamId){
        addTeamUser(teamId, options.user)
      });
    });
};
