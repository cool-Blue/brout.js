/**
 * Adjusted by cool.blue on 08-Sep-16.
 */
var page;

// user supplied url
var myurl = system.args[1] || 'https://waffles.ch/';

page = require('webpage').create();

// suppress errors from output
page.onError = function(msg, trace) {};

function exitPhantom (message) {
  console.log(message)
  phantom.exit(message.match("Error:") ? 1 : 0)
}

page.onConsoleMessage = function(message) {
  system.stdout.write('> ' + message + '\n')
};

page.onInitialized = function() {
  page.injectJs('request-animation-frame.js');
};

// 5 seconds
page.settings.resourceTimeout = 10000;

// page.settings.javascriptEnabled = false;
page.open(myurl, function(status) {

  //hack for page.open not hooking into phantom.onError
  setTimeout(function() {
    if (status !== "success") {
      exitPhantom('Error: ' + status);
      throw new Error("Unable to access network");
    } else {
      var pageTitle = myurl.replace(/http.*\/\//g, "").replace("www.", "").split("/")[0];
      var filePath = "img/" + pageTitle + '.jpg';
      page.render(filePath, {format: 'jpeg', quality: '75'});
      console.log(filePath);
      exitPhantom(status);
    }
  }, 1000);

});

