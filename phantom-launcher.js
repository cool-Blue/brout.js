/**
 * Created by cool.blue on 11-Sep-16.
 */
var phantom = require('phantom');

var sitePage = null;
var phInstance = null;
phantom.create()
  .then(instance => {
    phInstance = instance;
    return instance.createPage();
  })
  .then(page => {
    sitePage = page;
    // var system = require('system');

    var myurl = 'testAnimation.html';

    return Promise.all([
      (function initialised() {
        var inits = [1, 2].map(_ => Promise.resolve(null));
        page.on('onInitialized', (function() {
          var initialised;
          return function() {
            if(!initialised) {
              console.log('initialising...');
              [
                page.invokeAsyncMethod('injectJs', 'test-inject.js'),
                page.invokeAsyncMethod('injectJs', 'request-animation-frame.js')
              ].forEach((p, i) => inits[i].then(() => p));
              initialised = true;
            }
          }
        })());
        return Promise.all(inits)
      })(),
      // 5 seconds
      page.setting('resourceTimeout', 10000),
      page.on('onConsoleMessage', function(message) {
        process.stdout.write('> ' + message + '\n')
      }),
      page.property('myurl', myurl),
      page.defineMethod('_screenShot', function screenShot(status) {
        //hack for page.open not hooking into phantom.onError
        var self = this;
        console.log(status)
        setTimeout(function() {
          if(status !== "success") {
            throw new Error("Unable to access network");
          } else {
            var pageTitle = self.myurl.replace(/http.*\/\//g, "").replace("www.", "").split("/")[0];
            var filePath = "img/" + pageTitle + '.jpg';
            self.render(filePath, {format: 'jpeg', quality: '75'});
            console.log(filePath);
          }
        }, 5000);
      })
    ])
      .then(_ => {
        return page.open(myurl);
      })
      .then(status => {
        console.log('open: ' + status);
        return page.evaluate(function() {inject()})
          .then(_ => {
            return page.invokeMethod('_screenShot', status)
          })
          .then(_ => {
            return new Promise((r) => {
              console.log('image saved');
              r()
            })
          });
      })
  })
  .then( _ => {
    console.log('exiting...');
    sitePage.close();
    phInstance.exit();
  })
  .catch(error => {
    console.log(error);
    phInstance.exit();
  });
