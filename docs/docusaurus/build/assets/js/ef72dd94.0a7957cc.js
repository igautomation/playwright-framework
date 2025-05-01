'use strict';
(self.webpackChunkplaywright_framework_docs =
  self.webpackChunkplaywright_framework_docs || []).push([
  [62],
  {
    90: (t, e, n) => {
      n.r(e),
        n.d(e, {
          assets: () => i,
          contentTitle: () => a,
          default: () => p,
          frontMatter: () => c,
          metadata: () => s,
          toc: () => d
        });
      const s = JSON.parse(
        '{"id":"docusaurus/docs/ci-cd","title":"CI/CD\\\\nSet up GitHub Actions and Jenkins.","description":"","source":"@site/docs/docusaurus/docs/ci-cd.md","sourceDirName":"docusaurus/docs","slug":"/docusaurus/docs/ci-cd","permalink":"/playwright-framework/docs/docusaurus/docs/ci-cd","draft":false,"unlisted":false,"editUrl":"https://github.com/igautomation/playwright-framework/edit/main/docs/docs/docusaurus/docs/ci-cd.md","tags":[],"version":"current","frontMatter":{},"sidebar":"docs","previous":{"title":"Extending\\\\nAdd custom page objects in .","permalink":"/playwright-framework/docs/docusaurus/docs/extending"},"next":{"title":"Jira/Xray\\\\nIntegrate with Xray for test management.","permalink":"/playwright-framework/docs/docusaurus/docs/jira-xray"}}'
      );
      var o = n(4848),
        r = n(8453);
      const c = {},
        a = 'CI/CD\nSet up GitHub Actions and Jenkins.',
        i = {},
        d = [];
      function u(t) {
        const e = { h1: 'h1', header: 'header', ...(0, r.R)(), ...t.components };
        return (0, o.jsx)(e.header, {
          children: (0, o.jsx)(e.h1, {
            id: 'cicdnset-up-github-actions-and-jenkins',
            children: 'CI/CD\\nSet up GitHub Actions and Jenkins.'
          })
        });
      }
      function p(t = {}) {
        const { wrapper: e } = { ...(0, r.R)(), ...t.components };
        return e ? (0, o.jsx)(e, { ...t, children: (0, o.jsx)(u, { ...t }) }) : u(t);
      }
    },
    8453: (t, e, n) => {
      n.d(e, { R: () => c, x: () => a });
      var s = n(6540);
      const o = {},
        r = s.createContext(o);
      function c(t) {
        const e = s.useContext(r);
        return s.useMemo(
          function () {
            return 'function' == typeof t ? t(e) : { ...e, ...t };
          },
          [e, t]
        );
      }
      function a(t) {
        let e;
        return (
          (e = t.disableParentContext
            ? 'function' == typeof t.components
              ? t.components(o)
              : t.components || o
            : c(t.components)),
          s.createElement(r.Provider, { value: e }, t.children)
        );
      }
    }
  }
]);
