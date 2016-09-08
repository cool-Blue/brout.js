/**
 * Created by cool.blue on 19-Aug-16.
 */

'use strict';

var sourceFile = "./test/brout-test.js";

var b = require('browserify');
const mocaccino = require('mocaccino');
const phantomic = require('phantomic');

console.log('open "http://localhost:9000" then select ' + module.filename
  + '\nthen type "__run() in the console"');

phantomic(
  b()
    .plugin(mocaccino)
    .add(sourceFile)
    .bundle(),
  {
    debug: true,
    port: 0,
    brout: false,
    'web-security': false,
    'ignore-ssl-errors': true
  }, function(code) {
    process.exit(code);
  }).pipe(process.stdout);

process.on('beforeExit', function() {
  console.log('beforeExit');
});
process.on('exit', function() {
  console.log('exit');
});