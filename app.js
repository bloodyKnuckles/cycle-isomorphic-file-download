let xs = require('xstream').default;
let {div, ul, li, a, section, h1, p, form, input, button} = require('@cycle/dom');

function renderMenu() {
  return (
    ul([
      li([ a('.link', {attrs: {href: '/'}}, 'Home') ]),
      li([ a('.link', {attrs: {href: '/about'}}, 'About') ]),
      li([ a('.link', {attrs: {href: '/test'}}, 'Test') ]),
    ])
  );
}

function renderHomePage() {
  return (
    section('.home', [
      renderMenu(),
      h1('The homepage'),
      p('Welcome to our spectacular web page with nothing special here.'),
    ])
  );
}

function renderAboutPage() {
  return (
    section('.about', [
      renderMenu(),
      form('#pdfform', {attrs: {method: 'post', action: '/file', target: '_blank', style: 'display: none;'}}, [
        input('#filename', {attrs: {name: 'filename', type: 'input'}}),
      ]),
      button('#pdfbutton', 'view pdf')
    ])
  );
}

function renderTestPage() {
  return (
    section('.test', [
      renderMenu(),
      h1('Test page.'),
      p('This is the test page.'),
    ])
  );
}

function app(sources) {
  const buttonclick$ = sources.DOM.select('#pdfbutton').events('click');
  const api$ = xs.of('test.pdf');
  const post$ = buttonclick$.map(bclick => api$).flatten();

  let click$ = sources.DOM.select('.link').events('click');
  let preventedEvent$ = click$;
  let contextFromClick$ = click$
    .map(ev => ({route: ev.currentTarget.attributes.href.value}));
  let context$ = xs.merge(sources.context, contextFromClick$);

  let vtree$ = context$
    .map(({route}) => {
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', route);
      }
      switch (route) {
        case '/': return renderHomePage();
        case '/about': return renderAboutPage();
        case '/test': return renderTestPage();
        default: return div(`Unknown page ${route}`)
      }
    });

  return {
    DOM: vtree$,
    PreventDefault: preventedEvent$,
    FORM: post$
  };
}

module.exports = app;
