let Cycle = require('@cycle/xstream-run');
let xs = require('xstream').default;
let {makeDOMDriver} = require('@cycle/dom');
let app = require('./app');

function preventDefaultDriver(ev$) {
  ev$.addListener({
    next: ev => ev.preventDefault(),
    error: () => {},
    complete: () => {},
  });
}

function makeFormDriver (formId, elemId) {
  const form = document.querySelector(formId);
  const elem = document.querySelector(elemId);
  return function (file$) {
    file$.addListener({
      next: function (file) {
        elem.value = file;
        form.submit();
      },
      error: function () {},
      complete: function () {}
    });
  }
}

function clientSideApp(sources) {
  let sinks = app(sources);
  sinks.DOM = sinks.DOM.drop(1);
  return sinks; 
}

Cycle.run(clientSideApp, {
  DOM: makeDOMDriver('.app-container'),
  context: () => xs.of(window.appContext),
  PreventDefault: preventDefaultDriver,
  FORM: makeFormDriver('#pdfform', '#filename')
});
