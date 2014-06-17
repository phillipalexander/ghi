/* config commander component
 * To use add require('../cmds/config.js')(program) to your commander.js based node executable before program.parse
 */
'use strict';

var fs = require('fs');
var path = require('path');
var shell = require('shelljs');


var config;

// search for the config.json file in the current directory
if (fs.existsSync(path.join(__dirname, '../config.json'))) {
  config = require('../config.json');
} else {
  // create a new config.json file
  shell.cp(path.join(__dirname, '../config.json.example'), path.join(__dirname, '../config.json'));
  console.log('You must set your GitHub token');
  console.log('Create a token using the GitHub web interface that has admin:org access');
  console.log('Then run \'ghi c\' to open the config.json and add your token');
  process.exit();
}

module.exports = function(program) {

  program
    .option('-c, --config [object]', 'configuration object', config);

  program
    .command('c')
    .version('0.0.1')
    .description('Configure: edit application settings')
    .action(function(){
      shell.exec('open ' + path.join(__dirname, '../config.json'));
      // Your code goes here
    });

};
