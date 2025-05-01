'use strict';
(self.webpackChunkplaywright_framework_docs =
  self.webpackChunkplaywright_framework_docs || []).push([
  [568],
  {
    6615: (t, o, e) => {
      e.r(o),
        e.d(o, {
          assets: () => i,
          contentTitle: () => a,
          default: () => l,
          frontMatter: () => c,
          metadata: () => r,
          toc: () => u
        });
      const r = JSON.parse(
        '{"id":"docusaurus/docs/intro","title":"Introduction\\\\nWelcome to the Playwright Framework.","description":"","source":"@site/docs/docusaurus/docs/intro.md","sourceDirName":"docusaurus/docs","slug":"/docusaurus/docs/intro","permalink":"/playwright-framework/docs/docusaurus/docs/intro","draft":false,"unlisted":false,"editUrl":"https://github.com/igautomation/playwright-framework/edit/main/docs/docs/docusaurus/docs/intro.md","tags":[],"version":"current","frontMatter":{},"sidebar":"docs","next":{"title":"Installation\\\\nInstall with .","permalink":"/playwright-framework/docs/docusaurus/docs/installation"}}'
      );
      var n = e(4848),
        s = e(8453);
      const c = {},
        a = 'Introduction\nWelcome to the Playwright Framework.',
        i = {},
        u = [];
      function d(t) {
        const o = { h1: 'h1', header: 'header', ...(0, s.R)(), ...t.components };
        return (0, n.jsx)(o.header, {
          children: (0, n.jsx)(o.h1, {
            id: 'introductionnwelcome-to-the-playwright-framework',
            children: 'Introduction\\nWelcome to the Playwright Framework.'
          })
        });
      }
      function l(t = {}) {
        const { wrapper: o } = { ...(0, s.R)(), ...t.components };
        return o ? (0, n.jsx)(o, { ...t, children: (0, n.jsx)(d, { ...t }) }) : d(t);
      }
    },
    8453: (t, o, e) => {
      e.d(o, { R: () => c, x: () => a });
      var r = e(6540);
      const n = {},
        s = r.createContext(n);
      function c(t) {
        const o = r.useContext(s);
        return r.useMemo(
          function () {
            return 'function' == typeof t ? t(o) : { ...o, ...t };
          },
          [o, t]
        );
      }
      function a(t) {
        let o;
        return (
          (o = t.disableParentContext
            ? 'function' == typeof t.components
              ? t.components(n)
              : t.components || n
            : c(t.components)),
          r.createElement(s.Provider, { value: o }, t.children)
        );
      }
    }
  }
]);
