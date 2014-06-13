/* repo commander component
 * To use add require('../cmds/repo.js')(program) to your commander.js based node executable before program.parse
 */
'use strict';

var request = require("superagent");
var fs = require('fs');
var path = require('path');
var open = require('open');
var inquirer = require("inquirer");


module.exports = function(program) {

  var addRepoWebHook = function addRepoWebHook(ownerName, repoName, callback, args){
    request
      .post("https://api.github.com/repos/" + ownerName + "/" + repoName + "/hooks")
      .query({access_token: program.config.github.token})
      .set('Content-Type', 'application/json')
      .send(program.config.github.webhook)
      .end(function(res) {
        if(res.ok) {
          console.log("webhook set: " + program.config.github.webhook.name);
          if(callback !== undefined && callback !== null) {
            callback.apply(this, args);
          }
        } else {
          console.log(res.body);
        }
      });
  }

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
            if (program.config.github.webhook !== "WEBHOOK_CONFIG_OBJECT" && typeof program.config.github.webhook === "object") {
              addRepoWebHook(owner, repo);
            };
            if(program.config.settings.openurls){
              console.log("opening url in browser...");
              open(res.body.html_url);
            }
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
                if(program.config.settings.openurls){
                  console.log("opening url in browser...");
                  open(res.body.html_url);
                }
                } else {
                  console.log(res.body);
                }
              });
          } else {
            console.log(res.body);
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
      var questions = [{
        type: "confirm",
        name: "repoDestroyConfirm",
        message: "Are you sure you want to permanently delete " + args + " from GitHub?",
        default: false
      }];
      inquirer.prompt(questions, function(answer) {
        if (answer.repoDestroyConfirm === true) {
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
        } else {
          console.log("...aborting.")
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
};
