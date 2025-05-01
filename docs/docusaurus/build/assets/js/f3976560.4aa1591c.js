'use strict';
(self.webpackChunkplaywright_framework_docs =
  self.webpackChunkplaywright_framework_docs || []).push([
  [795],
  {
    8453: (e, t, r) => {
      r.d(t, { R: () => i, x: () => s });
      var n = r(6540);
      const o = {},
        a = n.createContext(o);
      function i(e) {
        const t = n.useContext(a);
        return n.useMemo(
          function () {
            return 'function' == typeof e ? e(t) : { ...t, ...e };
          },
          [t, e]
        );
      }
      function s(e) {
        let t;
        return (
          (t = e.disableParentContext
            ? 'function' == typeof e.components
              ? e.components(o)
              : e.components || o
            : i(e.components)),
          n.createElement(a.Provider, { value: t }, e.children)
        );
      }
    },
    9536: (e, t, r) => {
      r.r(t),
        r.d(t, {
          assets: () => c,
          contentTitle: () => s,
          default: () => m,
          frontMatter: () => i,
          metadata: () => n,
          toc: () => l
        });
      const n = JSON.parse(
        '{"type":"mdx","permalink":"/playwright-framework/","source":"@site/src/pages/index.md","title":"Welcome to Playwright Framework\\\\nThis is an enterprise-grade test automation framework built with Playwright.","frontMatter":{},"unlisted":false}'
      );
      var o = r(4848),
        a = r(8453);
      const i = {},
        s =
          'Welcome to Playwright Framework\nThis is an enterprise-grade test automation framework built with Playwright.',
        c = {},
        l = [];
      function h(e) {
        const t = { h1: 'h1', header: 'header', ...(0, a.R)(), ...e.components };
        return (0, o.jsx)(t.header, {
          children: (0, o.jsx)(t.h1, {
            id: 'welcome-to-playwright-frameworknthis-is-an-enterprise-grade-test-automation-framework-built-with-playwright',
            children:
              'Welcome to Playwright Framework\\nThis is an enterprise-grade test automation framework built with Playwright.'
          })
        });
      }
      function m(e = {}) {
        const { wrapper: t } = { ...(0, a.R)(), ...e.components };
        return t ? (0, o.jsx)(t, { ...e, children: (0, o.jsx)(h, { ...e }) }) : h(e);
      }
    }
  }
]);
