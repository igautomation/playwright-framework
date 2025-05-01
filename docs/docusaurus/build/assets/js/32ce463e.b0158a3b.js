'use strict';
(self.webpackChunkplaywright_framework_docs =
  self.webpackChunkplaywright_framework_docs || []).push([
  [6],
  {
    27: (e, t, n) => {
      n.r(t),
        n.d(t, {
          assets: () => i,
          contentTitle: () => d,
          default: () => p,
          frontMatter: () => c,
          metadata: () => s,
          toc: () => a
        });
      const s = JSON.parse(
        '{"id":"docusaurus/docs/extending","title":"Extending\\\\nAdd custom page objects in .","description":"","source":"@site/docs/docusaurus/docs/extending.md","sourceDirName":"docusaurus/docs","slug":"/docusaurus/docs/extending","permalink":"/playwright-framework/docs/docusaurus/docs/extending","draft":false,"unlisted":false,"editUrl":"https://github.com/igautomation/playwright-framework/edit/main/docs/docs/docusaurus/docs/extending.md","tags":[],"version":"current","frontMatter":{},"sidebar":"docs","previous":{"title":"Writing Tests\\\\nUse POM for UI and POJOs for API.","permalink":"/playwright-framework/docs/docusaurus/docs/writing-tests"},"next":{"title":"CI/CD\\\\nSet up GitHub Actions and Jenkins.","permalink":"/playwright-framework/docs/docusaurus/docs/ci-cd"}}'
      );
      var o = n(4848),
        r = n(8453);
      const c = {},
        d = 'Extending\nAdd custom page objects in .',
        i = {},
        a = [];
      function u(e) {
        const t = { h1: 'h1', header: 'header', ...(0, r.R)(), ...e.components };
        return (0, o.jsx)(t.header, {
          children: (0, o.jsx)(t.h1, {
            id: 'extendingnadd-custom-page-objects-in-',
            children: 'Extending\\nAdd custom page objects in .'
          })
        });
      }
      function p(e = {}) {
        const { wrapper: t } = { ...(0, r.R)(), ...e.components };
        return t ? (0, o.jsx)(t, { ...e, children: (0, o.jsx)(u, { ...e }) }) : u(e);
      }
    },
    8453: (e, t, n) => {
      n.d(t, { R: () => c, x: () => d });
      var s = n(6540);
      const o = {},
        r = s.createContext(o);
      function c(e) {
        const t = s.useContext(r);
        return s.useMemo(
          function () {
            return 'function' == typeof e ? e(t) : { ...t, ...e };
          },
          [t, e]
        );
      }
      function d(e) {
        let t;
        return (
          (t = e.disableParentContext
            ? 'function' == typeof e.components
              ? e.components(o)
              : e.components || o
            : c(e.components)),
          s.createElement(r.Provider, { value: t }, e.children)
        );
      }
    }
  }
]);
