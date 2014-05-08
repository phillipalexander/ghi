/* repo commander component
 * To use add require('../cmds/repo.js')(program) to your commander.js based node executable before program.parse
 */
'use strict';

var request = require("superagent");
var fs = require('fs');
var path = require('path');

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
    .action(function(fullname) {
      var owner = fullname.split("/")[0];
      var repo = fullname.split("/")[1];

      // first try as org
      request
        .post("https://api.github.com/orgs/" + owner + "/repos")
        .query({access_token: config.github.token})
        .set('Content-Type', 'application/json')
        .send({name: repo})
        .send({private: true})
        .send({has_issues: false})
        .send({has_wiki: false})
        .send({auto_init: false})
        .end(function(res) {
          if(res.ok) {
            console.log("url: " + res.body.html_url);
          } else if (res.notFound) {
            // if creating as an org fails, try as user
            request
              .post("https://api.github.com/user/repos")
              .query({access_token: config.github.token})
              .set('Content-Type', 'application/json')
              .send({name: repo})
              .send({private: true})
              .send({has_issues: false})
              .send({has_wiki: false})
              .send({auto_init: false})
              .end(function(res) {
                if(res.ok) {
                  console.log("url: " + res.body.html_url);
                } else {
                  console.log(res.body)
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
            console.log(res.body)
          }
        });

    });

};
