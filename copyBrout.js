/**
 * Created by cool.blue on 21-Aug-16.
 */
var fs = require('fs');
var broutSrc = './lib/brout';
fs.createReadStream(broutSrc + '.js')
  .pipe(fs.createWriteStream(broutSrc + '1.js'));
