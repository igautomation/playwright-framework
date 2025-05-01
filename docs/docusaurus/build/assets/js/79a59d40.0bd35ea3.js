'use strict';
(self.webpackChunkplaywright_framework_docs =
  self.webpackChunkplaywright_framework_docs || []).push([
  [534],
  {
    3094: (t, s, e) => {
      e.r(s),
        e.d(s, {
          assets: () => a,
          contentTitle: () => c,
          default: () => f,
          frontMatter: () => i,
          metadata: () => o,
          toc: () => u
        });
      const o = JSON.parse(
        '{"id":"docusaurus/docs/writing-tests","title":"Writing Tests\\\\nUse POM for UI and POJOs for API.","description":"","source":"@site/docs/docusaurus/docs/writing-tests.md","sourceDirName":"docusaurus/docs","slug":"/docusaurus/docs/writing-tests","permalink":"/playwright-framework/docs/docusaurus/docs/writing-tests","draft":false,"unlisted":false,"editUrl":"https://github.com/igautomation/playwright-framework/edit/main/docs/docs/docusaurus/docs/writing-tests.md","tags":[],"version":"current","frontMatter":{},"sidebar":"docs","previous":{"title":"Configuration\\\\nConfigure  and .","permalink":"/playwright-framework/docs/docusaurus/docs/configuration"},"next":{"title":"Extending\\\\nAdd custom page objects in .","permalink":"/playwright-framework/docs/docusaurus/docs/extending"}}'
      );
      var r = e(4848),
        n = e(8453);
      const i = {},
        c = 'Writing Tests\nUse POM for UI and POJOs for API.',
        a = {},
        u = [];
      function d(t) {
        const s = { h1: 'h1', header: 'header', ...(0, n.R)(), ...t.components };
        return (0, r.jsx)(s.header, {
          children: (0, r.jsx)(s.h1, {
            id: 'writing-testsnuse-pom-for-ui-and-pojos-for-api',
            children: 'Writing Tests\\nUse POM for UI and POJOs for API.'
          })
        });
      }
      function f(t = {}) {
        const { wrapper: s } = { ...(0, n.R)(), ...t.components };
        return s ? (0, r.jsx)(s, { ...t, children: (0, r.jsx)(d, { ...t }) }) : d(t);
      }
    },
    8453: (t, s, e) => {
      e.d(s, { R: () => i, x: () => c });
      var o = e(6540);
      const r = {},
        n = o.createContext(r);
      function i(t) {
        const s = o.useContext(n);
        return o.useMemo(
          function () {
            return 'function' == typeof t ? t(s) : { ...s, ...t };
          },
          [s, t]
        );
      }
      function c(t) {
        let s;
        return (
          (s = t.disableParentContext
            ? 'function' == typeof t.components
              ? t.components(r)
              : t.components || r
            : i(t.components)),
          o.createElement(n.Provider, { value: s }, t.children)
        );
      }
    }
  }
]);
