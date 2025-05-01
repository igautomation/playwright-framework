'use strict';
(self.webpackChunkplaywright_framework_docs =
  self.webpackChunkplaywright_framework_docs || []).push([
  [796],
  {
    8318: (t, n, o) => {
      o.r(n),
        o.d(n, {
          assets: () => c,
          contentTitle: () => i,
          default: () => d,
          frontMatter: () => a,
          metadata: () => s,
          toc: () => l
        });
      const s = JSON.parse(
        '{"id":"docusaurus/docs/installation","title":"Installation\\\\nInstall with .","description":"","source":"@site/docs/docusaurus/docs/installation.md","sourceDirName":"docusaurus/docs","slug":"/docusaurus/docs/installation","permalink":"/playwright-framework/docs/docusaurus/docs/installation","draft":false,"unlisted":false,"editUrl":"https://github.com/igautomation/playwright-framework/edit/main/docs/docs/docusaurus/docs/installation.md","tags":[],"version":"current","frontMatter":{},"sidebar":"docs","previous":{"title":"Introduction\\\\nWelcome to the Playwright Framework.","permalink":"/playwright-framework/docs/docusaurus/docs/intro"},"next":{"title":"Configuration\\\\nConfigure  and .","permalink":"/playwright-framework/docs/docusaurus/docs/configuration"}}'
      );
      var e = o(4848),
        r = o(8453);
      const a = {},
        i = 'Installation\nInstall with .',
        c = {},
        l = [];
      function u(t) {
        const n = { h1: 'h1', header: 'header', ...(0, r.R)(), ...t.components };
        return (0, e.jsx)(n.header, {
          children: (0, e.jsx)(n.h1, {
            id: 'installationninstall-with-',
            children: 'Installation\\nInstall with .'
          })
        });
      }
      function d(t = {}) {
        const { wrapper: n } = { ...(0, r.R)(), ...t.components };
        return n ? (0, e.jsx)(n, { ...t, children: (0, e.jsx)(u, { ...t }) }) : u(t);
      }
    },
    8453: (t, n, o) => {
      o.d(n, { R: () => a, x: () => i });
      var s = o(6540);
      const e = {},
        r = s.createContext(e);
      function a(t) {
        const n = s.useContext(r);
        return s.useMemo(
          function () {
            return 'function' == typeof t ? t(n) : { ...n, ...t };
          },
          [n, t]
        );
      }
      function i(t) {
        let n;
        return (
          (n = t.disableParentContext
            ? 'function' == typeof t.components
              ? t.components(e)
              : t.components || e
            : a(t.components)),
          s.createElement(r.Provider, { value: n }, t.children)
        );
      }
    }
  }
]);
