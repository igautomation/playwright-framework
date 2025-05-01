'use strict';
(self.webpackChunkplaywright_framework_docs =
  self.webpackChunkplaywright_framework_docs || []).push([
  [857],
  {
    2141: (t, e, s) => {
      s.r(e),
        s.d(e, {
          assets: () => c,
          contentTitle: () => u,
          default: () => l,
          frontMatter: () => n,
          metadata: () => i,
          toc: () => a
        });
      const i = JSON.parse(
        '{"id":"docusaurus/docs/utilities","title":"Utilities\\\\nReusable utilities in .","description":"","source":"@site/docs/docusaurus/docs/utilities.md","sourceDirName":"docusaurus/docs","slug":"/docusaurus/docs/utilities","permalink":"/playwright-framework/docs/docusaurus/docs/utilities","draft":false,"unlisted":false,"editUrl":"https://github.com/igautomation/playwright-framework/edit/main/docs/docs/docusaurus/docs/utilities.md","tags":[],"version":"current","frontMatter":{},"sidebar":"docs","previous":{"title":"CLI\\\\nUse Error: No tests found to execute tests.","permalink":"/playwright-framework/docs/docusaurus/docs/cli"},"next":{"title":"Page Objects\\\\nFollow POM best practices.","permalink":"/playwright-framework/docs/docusaurus/docs/page-objects"}}'
      );
      var o = s(4848),
        r = s(8453);
      const n = {},
        u = 'Utilities\nReusable utilities in .',
        c = {},
        a = [];
      function d(t) {
        const e = { h1: 'h1', header: 'header', ...(0, r.R)(), ...t.components };
        return (0, o.jsx)(e.header, {
          children: (0, o.jsx)(e.h1, {
            id: 'utilitiesnreusable-utilities-in-',
            children: 'Utilities\\nReusable utilities in .'
          })
        });
      }
      function l(t = {}) {
        const { wrapper: e } = { ...(0, r.R)(), ...t.components };
        return e ? (0, o.jsx)(e, { ...t, children: (0, o.jsx)(d, { ...t }) }) : d(t);
      }
    },
    8453: (t, e, s) => {
      s.d(e, { R: () => n, x: () => u });
      var i = s(6540);
      const o = {},
        r = i.createContext(o);
      function n(t) {
        const e = i.useContext(r);
        return i.useMemo(
          function () {
            return 'function' == typeof t ? t(e) : { ...e, ...t };
          },
          [e, t]
        );
      }
      function u(t) {
        let e;
        return (
          (e = t.disableParentContext
            ? 'function' == typeof t.components
              ? t.components(o)
              : t.components || o
            : n(t.components)),
          i.createElement(r.Provider, { value: e }, t.children)
        );
      }
    }
  }
]);
