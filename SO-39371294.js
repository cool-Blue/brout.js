/**
 * Adjusted by cool.blue on 08-Sep-16.
 */
/*global phantom*/
'use strict';
var system = require('system');
var page;

// user supplied url
var myurl = 'http://phantomjs.org/api/webpage/method/include-js.html';
// var myurl = 'https://waffles.ch/';

page = require('webpage').create();

// suppress errors from output
page.onError = function(msg, trace) {};

function ExtendTimers (page) {
  var EXIT_MESSAGE = '>>>EXIT ';
  var _timers = [];

  page.onConsoleMessage = function(message) {
    if(message.indexOf(EXIT_MESSAGE) === 0) {
      setTimeout(function() {
        system.stdout.write(message.replace(EXIT_MESSAGE, "") + '\n');
        phantom.exit(1);
      }, 0);
    }
  };
  page._watchdog = (function () {
    return function timeOut(t) {
      page.evaluate(function(TIMEOUT, EXIT_MESSAGE, timers) {
        timers.push(setTimeout(function() {
          timers.forEach(clearTimeout);
          console.log(EXIT_MESSAGE + "time out error");
        }, TIMEOUT));
      }, t, EXIT_MESSAGE, _timers);
    }
  })();
  page._exit = (function () {
    return function (reason) {
      page.evaluate(function(message, timers) {
        timers.forEach(clearTimeout);
        console.log(message);
      }, EXIT_MESSAGE + reason, _timers);
    }
  })();
  page._setTimer = function (f, t) {
    _timers.push(setTimeout(f, t))
  }}
ExtendTimers(page);
// fall-back timer in case the page hangs

// 5 seconds
page.settings.resourceTimeout = 1000;

// page.settings.javascriptEnabled = false;
page.open(myurl, function(status) {

  page._setTimer(function() {
    console.log('psst')
  }, 2000);

  //hack for page.open not hooking into phantom.onError
  page._setTimer(function() {
    if (status !== "success") {
      console.log("bugger...");
      page._exit("fail");
      throw new Error("Unable to access network");
    } else {
      var pageTitle = myurl.replace(/http.*\/\//g, "").replace("www.", "").split("/")[0];
      var filePath = "img/" + pageTitle + '.jpg';
      page.render(filePath, {format: 'jpeg', quality: '75'});
      console.log(filePath);
      page._exit("success");
    }
  }, 0);

  page._watchdog(2000);

});