/* repo commander component
 * To use add require('../cmds/repo.js')(program) to your commander.js based node executable before program.parse
 */
'use strict';

var request = require("superagent");
var fs = require('fs');
var path = require('path');
var inquirer = require("inquirer");
var shell = require('shelljs');


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
  };

  var repoSubscribe = function repoSubscribe(ownerName, repoName, callback, args){
    request
      .put("https://api.github.com/repos/" + ownerName + "/" + repoName + "/subscription")
      .query({access_token: program.config.github.token})
      .set('Content-Type', 'application/json')
      .send({"subscribed": "true"})
      .end(function(res) {
        if(res.ok) {
          console.log("subscribed to " + ownerName + "/" + repoName);
          if(callback !== undefined && callback !== null) {
            callback.apply(this, args);
          }
        } else {
          console.log(res.body);
        }
      });
  };

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
        auto_init: true,
        gitignore_template: "Yeoman"
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
            repoSubscribe(owner, repo);
            if (program.config.github.webhook !== "WEBHOOK_CONFIG_OBJECT" && typeof program.config.github.webhook === "object") {
              addRepoWebHook(owner, repo);
            };
            if(program.config.settings.openurls){
              console.log("opening url in browser...");
              shell.exec('open ' + res.body.html_url);
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
                  repoSubscribe(owner, repo);
                if(program.config.settings.openurls){
                  console.log("opening url in browser...");
                  shell.exec('open ' + res.body.html_url);
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

  // Example Usage: ghi rhc macroscope/blog
  program
    .command('rhc <orgname\/reponame>')
    .version('0.0.2')
    .description('Repo Hook Create: Add webhook defined in config.json to a repo')
    .action(function(args){
      var owner = args.split("/")[0];
      var repo = args.split("/")[1];

      addRepoWebHook(owner, repo);
    })

  // Example Usage: ghi rpn -o "macroscope" -r "venus" -p "mars"
  program
    .command('rpn')
    .description('Repo Patch Name: change the name of an existing repo')
    .option('-o, --org <orgname>', 'GitHub OrgName')
    .option('-r, --repo <reponame>', 'GitHub RepoName')
    .option('-p, --patch <patchdata>', 'Updated RepoName')
    .action(function(options){

      request
        .patch('https://api.github.com/repos/' + options.org + '/' + options.repo)
        .query({access_token: program.config.github.token})
        .set('Content-Type', 'application/json')
        .send({"name": options.patch})
        .end(function(res) {
          if(res.ok) {
            console.log("name successfully updated");
          } else {
            console.log(res.body);
          }
        });

    });

  // Example Usage: ghi rs -s "hackreactor-labs" -t "hackreactor" -r "hiring"
  program
    .command('rs')
    .description('Repo Sync: sync a repo across owners using force push')
    .option('-s, --ownersource <ownersource>', 'GitHub Source Owner')
    .option('-t, --ownertarget <ownertarget>', 'GitHub Target Owner')
    .option('-r, --reponame <reponame>', 'RepoName')
    .action(function(options){

      var sourceUrl = 'git@github.com:' + options.ownersource + '/' + options.reponame + '.git';
      var targetUrl = 'git@github.com:' + options.ownertarget + '/' + options.reponame + '.git';
      var tempPath = '/tmp/ghi/' + options.reponame;
      shell.mkdir('-p', '/tmp/ghi');

      if (!shell.which('git')) {
        shell.echo('Sorry, this script requires git');
        shell.exit(1);
      }
      if (shell.exec('git clone ' + sourceUrl + ' ' + tempPath).code !== 0) {
        shell.echo('Error: Git clone failed');
        shell.exit(1);
      }
      shell.cd(tempPath)
      if (shell.exec('git push ' + targetUrl + ' -f').code !== 0) {
        shell.echo('Error: Git push failed');
        shell.exit(1);
      }
      shell.rm('-rf', tempPath);
    });
};
