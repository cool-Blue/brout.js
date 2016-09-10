/**
 * Created by cool.blue on 10-Sep-16.
 */
  // Include a performance.now polyfill
var now = (function () {
    // In node.js, use process.hrtime.
    if (this.window === undefined && this.process !== undefined) {
      now = function () {
        var time = process.hrtime();

        // Convert [seconds, microseconds] to milliseconds.
        return time[0] * 1000 + time[1] / 1000;
      };
    }
    // In a browser, use window.performance.now if it is available.
    else if (this.window !== undefined &&
      window.performance !== undefined &&
      window.performance.now !== undefined) {

      // This must be bound, because directly assigning this function
      // leads to an invocation exception in Chrome.
      now = window.performance.now.bind(window.performance);
    }
    // Use Date.now if it is available.
    else if (Date.now !== undefined) {
      now = Date.now;
    }
    // Otherwise, use 'new Date().getTime()'.
    else {
      now = function () {
        return new Date().getTime();
      };
    }
    return now
  })();

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

// MIT license

(function() {
  var lastTime = 0;
  window.requestAnimationFrame = function(callback, element) {
    var currTime = now();
    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
    var id = window.setTimeout(function() { callback(currTime + timeToCall); },
      timeToCall);
    lastTime = currTime + timeToCall;
    return id;
  };
  window.cancelAnimationFrame = function(id) {
    clearTimeout(id);
  };
}());
