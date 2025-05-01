'use strict';
(self.webpackChunkplaywright_framework_docs =
  self.webpackChunkplaywright_framework_docs || []).push([
  [437],
  {
    6191: (e, t, s) => {
      s.r(t),
        s.d(t, {
          assets: () => i,
          contentTitle: () => a,
          default: () => l,
          frontMatter: () => n,
          metadata: () => o,
          toc: () => u
        });
      const o = JSON.parse(
        '{"id":"docusaurus/docs/page-objects","title":"Page Objects\\\\nFollow POM best practices.","description":"","source":"@site/docs/docusaurus/docs/page-objects.md","sourceDirName":"docusaurus/docs","slug":"/docusaurus/docs/page-objects","permalink":"/playwright-framework/docs/docusaurus/docs/page-objects","draft":false,"unlisted":false,"editUrl":"https://github.com/igautomation/playwright-framework/edit/main/docs/docs/docusaurus/docs/page-objects.md","tags":[],"version":"current","frontMatter":{},"sidebar":"docs","previous":{"title":"Utilities\\\\nReusable utilities in .","permalink":"/playwright-framework/docs/docusaurus/docs/utilities"},"next":{"title":"POJOs\\\\nUse POJOs for API testing.","permalink":"/playwright-framework/docs/docusaurus/docs/pojos"}}'
      );
      var r = s(4848),
        c = s(8453);
      const n = {},
        a = 'Page Objects\nFollow POM best practices.',
        i = {},
        u = [];
      function d(e) {
        const t = { h1: 'h1', header: 'header', ...(0, c.R)(), ...e.components };
        return (0, r.jsx)(t.header, {
          children: (0, r.jsx)(t.h1, {
            id: 'page-objectsnfollow-pom-best-practices',
            children: 'Page Objects\\nFollow POM best practices.'
          })
        });
      }
      function l(e = {}) {
        const { wrapper: t } = { ...(0, c.R)(), ...e.components };
        return t ? (0, r.jsx)(t, { ...e, children: (0, r.jsx)(d, { ...e }) }) : d(e);
      }
    },
    8453: (e, t, s) => {
      s.d(t, { R: () => n, x: () => a });
      var o = s(6540);
      const r = {},
        c = o.createContext(r);
      function n(e) {
        const t = o.useContext(c);
        return o.useMemo(
          function () {
            return 'function' == typeof e ? e(t) : { ...t, ...e };
          },
          [t, e]
        );
      }
      function a(e) {
        let t;
        return (
          (t = e.disableParentContext
            ? 'function' == typeof e.components
              ? e.components(r)
              : e.components || r
            : n(e.components)),
          o.createElement(c.Provider, { value: t }, e.children)
        );
      }
    }
  }
]);
