'use strict';
(self.webpackChunkplaywright_framework_docs =
  self.webpackChunkplaywright_framework_docs || []).push([
  [970],
  {
    8453: (e, t, s) => {
      s.d(t, { R: () => c, x: () => u });
      var o = s(6540);
      const r = {},
        n = o.createContext(r);
      function c(e) {
        const t = o.useContext(n);
        return o.useMemo(
          function () {
            return 'function' == typeof e ? e(t) : { ...t, ...e };
          },
          [t, e]
        );
      }
      function u(e) {
        let t;
        return (
          (t = e.disableParentContext
            ? 'function' == typeof e.components
              ? e.components(r)
              : e.components || r
            : c(e.components)),
          o.createElement(n.Provider, { value: t }, e.children)
        );
      }
    },
    9065: (e, t, s) => {
      s.r(t),
        s.d(t, {
          assets: () => a,
          contentTitle: () => u,
          default: () => l,
          frontMatter: () => c,
          metadata: () => o,
          toc: () => i
        });
      const o = JSON.parse(
        '{"id":"docusaurus/docs/cli","title":"CLI\\\\nUse Error: No tests found to execute tests.","description":"","source":"@site/docs/docusaurus/docs/cli.md","sourceDirName":"docusaurus/docs","slug":"/docusaurus/docs/cli","permalink":"/playwright-framework/docs/docusaurus/docs/cli","draft":false,"unlisted":false,"editUrl":"https://github.com/igautomation/playwright-framework/edit/main/docs/docs/docusaurus/docs/cli.md","tags":[],"version":"current","frontMatter":{},"sidebar":"docs","previous":{"title":"Jira/Xray\\\\nIntegrate with Xray for test management.","permalink":"/playwright-framework/docs/docusaurus/docs/jira-xray"},"next":{"title":"Utilities\\\\nReusable utilities in .","permalink":"/playwright-framework/docs/docusaurus/docs/utilities"}}'
      );
      var r = s(4848),
        n = s(8453);
      const c = {},
        u = 'CLI\nUse Error: No tests found to execute tests.',
        a = {},
        i = [];
      function d(e) {
        const t = { h1: 'h1', header: 'header', ...(0, n.R)(), ...e.components };
        return (0, r.jsx)(t.header, {
          children: (0, r.jsx)(t.h1, {
            id: 'clinuse-error-no-tests-found-to-execute-tests',
            children: 'CLI\\nUse Error: No tests found to execute tests.'
          })
        });
      }
      function l(e = {}) {
        const { wrapper: t } = { ...(0, n.R)(), ...e.components };
        return t ? (0, r.jsx)(t, { ...e, children: (0, r.jsx)(d, { ...e }) }) : d(e);
      }
    }
  }
]);
