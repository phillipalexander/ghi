/* org commander component
 * To use add require('../cmds/org.js')(program) to your commander.js based node executable before program.parse
 */
'use strict';

var request = require("superagent");

module.exports = function(program) {

  // Example Usage: ghi ogr macroscope
  program
    .command('ogr <orgname>')
    .version('0.0.2')
    .description('Org Get Repos: Get the first 100 repos associated with an Org')
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

  // Example Usage: ghi ogt macroscope
  program
    .command('ogt <orgname>')
    .version('0.0.2')
    .description('Org Get Teams: Get the first 100 teams associated with an Org')
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

};
