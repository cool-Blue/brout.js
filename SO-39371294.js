/**
 * Adjusted by cool.blue on 08-Sep-16.
 */
/*global phantom*/
'use strict';
var system = require('system');
var page;

// user supplied url
var myurl = system.args[1];
// var myurl = 'http://phantomjs.org/api/webpage/method/include-js.html';
// var myurl = 'https://www.koshkamashkaeshop.com/fr/28-robes-Koshka-Mashka'
myurl = myurl || 'https://waffles.ch/';

page = require('webpage').create();

// suppress errors from output
page.onError = function(msg, trace) {
  console.err(msg);
  console.err(trace)
};

// page management
function ExtendTimers (page) {
  var EXIT_MESSAGE = '>>>EXIT';
  var _page_timers = [], _outer_timers = [];

  function _exitPhantom (code) {
    console.log('exiting')
    phantom.exit(code)
  }

  page.onConsoleMessage = function(message) {
    if(message.indexOf(EXIT_MESSAGE) === 0) {
      setTimeout(function() {
        system.stdout.write(message.replace(EXIT_MESSAGE, "") + '\n');
        _exitPhantom(message.match("Error:") ? 1 : 0);
      }, 0);
    } else {
      system.stdout.write('> ' + message + '\n')
    }
  };
  page._watchdog = (function() {
    // any time over abut 1.6 secs never fires
    return function timeOut(t) {
      _page_timers.push(page.evaluate(
        function(t, m) {
          return setTimeout(function() {
            console.log(m + "Error: time out");
          }, t);
        }, t, EXIT_MESSAGE))
    }
  })();
  page._watchdog2 = (function() {
    // performs same as the evaluate version
    // any time over abut 1.6 secs never fires
    return function timeOut(t) {
      var source = 'function() {' +
        ' return setTimeout(function() {' +
        'console.log("' + EXIT_MESSAGE + "Error: time out" + '");' +
        '}, ' + t + ')' +
        '}';
      _page_timers.push(page.evaluateJavaScript(source));
      console.log(source + '\n' + _page_timers.length + '\t' + _page_timers);
    }
  })();
  page._watchdog3 = function timeOut(t) {
    _outer_timers.push(setTimeout(function() {
      console.log('Error: timeout');
      _exitPhantom(1);
    }, t));
  };
  page._exit = function(reason) {
    console.log('exit start')
    // _outer_timers.forEach(clearTimeout);
    page.evaluate(function(message, timers) {
      // timers.forEach(clearTimeout);
      console.log(message);
    }, EXIT_MESSAGE + reason, _page_timers);
  };
  page._exit2 = function(reason) {
    console.log(reason);
    _exitPhantom(0);
  };
  page._setOuterTimer = function timeOut(f, t) {
    _outer_timers.push(setTimeout(f, t));
  };
  page._setPageTimer = function(f, t) {
    return _page_timers.push(page.evaluate(
      function(f, t) {
        console.log('_setPageTimer ' + window.document.URL);
        return setTimeout(f, t)
      }
    ), f, t); // >>>>>>>WRONG!! cannot pass a function to evaluate<<<<<<<
  };
  page._setPageTimer2 = function(f, t) {
    var script;
    return _page_timers.push(page.evaluateJavaScript(
      (script = 'function () {' +
        'return setTimeout(' +
        f.toString() + ',' + t +
        ')}')
    ));
    // console.log(script)
  }
}
ExtendTimers(page);

// 5 seconds
page.settings.resourceTimeout = 10000;


page.onInitialized = function() {
  page.injectJs('test-inject.js');
  // page.injectJs('request-animation-frame.js');
};


page.onLoadStarted = function() {
  console.log('loadStart')

  page._setOuterTimer(function() {
    console.log('psst')
  }, 1000);

  page._setOuterTimer(function() {
    console.log('pssssst!')
  }, 2000);

  page._watchdog3(10000);
};

function screenShot(status) {
  //hack for page.open not hooking into phantom.onError
  setTimeout(function() {
    if (status !== "success") {
      page._exit2(status);
      throw new Error("Unable to access network");
    } else {
      var pageTitle = myurl.replace(/http.*\/\//g, "").replace("www.", "").split("/")[0];
      var filePath = "img/" + pageTitle + '.jpg';
      page.render(filePath, {format: 'jpeg', quality: '75'});
      console.log(filePath);
      page._exit2(status);
    }
  }, 1000);
}
// page.settings.javascriptEnabled = false;
page.open(myurl, function(status) {

  page.evaluate(function(){inject()});
  console.log('open: ' + status)
  screenShot(status);

});
