'use strict';
(self.webpackChunkplaywright_framework_docs =
  self.webpackChunkplaywright_framework_docs || []).push([
  [446],
  {
    8453: (s, o, e) => {
      e.d(o, { R: () => c, x: () => a });
      var t = e(6540);
      const r = {},
        n = t.createContext(r);
      function c(s) {
        const o = t.useContext(n);
        return t.useMemo(
          function () {
            return 'function' == typeof s ? s(o) : { ...o, ...s };
          },
          [o, s]
        );
      }
      function a(s) {
        let o;
        return (
          (o = s.disableParentContext
            ? 'function' == typeof s.components
              ? s.components(r)
              : s.components || r
            : c(s.components)),
          t.createElement(n.Provider, { value: o }, s.children)
        );
      }
    },
    9710: (s, o, e) => {
      e.r(o),
        e.d(o, {
          assets: () => u,
          contentTitle: () => a,
          default: () => p,
          frontMatter: () => c,
          metadata: () => t,
          toc: () => i
        });
      const t = JSON.parse(
        '{"id":"docusaurus/docs/pojos","title":"POJOs\\\\nUse POJOs for API testing.","description":"","source":"@site/docs/docusaurus/docs/pojos.md","sourceDirName":"docusaurus/docs","slug":"/docusaurus/docs/pojos","permalink":"/playwright-framework/docs/docusaurus/docs/pojos","draft":false,"unlisted":false,"editUrl":"https://github.com/igautomation/playwright-framework/edit/main/docs/docs/docusaurus/docs/pojos.md","tags":[],"version":"current","frontMatter":{},"sidebar":"docs","previous":{"title":"Page Objects\\\\nFollow POM best practices.","permalink":"/playwright-framework/docs/docusaurus/docs/page-objects"}}'
      );
      var r = e(4848),
        n = e(8453);
      const c = {},
        a = 'POJOs\nUse POJOs for API testing.',
        u = {},
        i = [];
      function d(s) {
        const o = { h1: 'h1', header: 'header', ...(0, n.R)(), ...s.components };
        return (0, r.jsx)(o.header, {
          children: (0, r.jsx)(o.h1, {
            id: 'pojosnuse-pojos-for-api-testing',
            children: 'POJOs\\nUse POJOs for API testing.'
          })
        });
      }
      function p(s = {}) {
        const { wrapper: o } = { ...(0, n.R)(), ...s.components };
        return o ? (0, r.jsx)(o, { ...s, children: (0, r.jsx)(d, { ...s }) }) : d(s);
      }
    }
  }
]);
