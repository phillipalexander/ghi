/* team commander component
 * To use add require('../cmds/team.js')(program) to your commander.js based node executable before program.parse
 */
'use strict';

var request = require("superagent");
var fs = require('fs');
var path = require('path');
var open = require('open');



module.exports = function(program) {

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
          if(callback !== undefined && callback !== null) {
            callback.apply(this, args);
          }
        } else {
          console.log(res.body);
        }
      });
  }

  var addTeamRepo = function addTeamRepo(teamId, orgName, repoName, callback, args){
    request
      .put("https://api.github.com/teams/" + teamId + "/repos/" + orgName + "/" + repoName)
      .query({access_token: program.config.github.token})
      .set('Content-Type', 'application/json')
      .end(function(res) {
        if(res.ok) {
          console.log(teamId + " granted access");
          if(callback !== undefined && callback !== null) {
            callback.apply(this, args);
          }
        } else {
          console.log(res.body);
        }
      });
  }

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
    .option('-o, --org <orgname>', 'GitHub OrgName')
    .option('-t, --team <teamname>', 'GitHub TeamName')
    .option('-u, --user <username>', 'GitHub UserName')
    .action(function(options){
      getTeamId(options.team, options.org, function(teamId){
        addTeamUser(teamId, options.user)
      });
    });

  // Example Usage: ghi tra -o "macroscope" -t "Team alexis" -u "alexanderphillip"
  program
    .command('tra')
    .description('Team Repo Add: Add a GitHub repo to an existing team')
    .option('-o, --org <orgname>', 'GitHub OrgName')
    .option('-t, --team <teamname>', 'GitHub TeamName')
    .option('-r, --repo <reponame>', 'GitHub RepoName')
    .action(function(options){
      getTeamId(options.team, options.org, function(teamId){
        addTeamRepo(teamId, options.org, options.repo)
      });
    });

};
