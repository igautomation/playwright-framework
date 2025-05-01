'use strict';
(self.webpackChunkplaywright_framework_docs =
  self.webpackChunkplaywright_framework_docs || []).push([
  [109],
  {
    1733: (t, e, r) => {
      r.r(e),
        r.d(e, {
          assets: () => i,
          contentTitle: () => c,
          default: () => m,
          frontMatter: () => o,
          metadata: () => a,
          toc: () => u
        });
      const a = JSON.parse(
        '{"id":"docusaurus/docs/jira-xray","title":"Jira/Xray\\\\nIntegrate with Xray for test management.","description":"","source":"@site/docs/docusaurus/docs/jira-xray.md","sourceDirName":"docusaurus/docs","slug":"/docusaurus/docs/jira-xray","permalink":"/playwright-framework/docs/docusaurus/docs/jira-xray","draft":false,"unlisted":false,"editUrl":"https://github.com/igautomation/playwright-framework/edit/main/docs/docs/docusaurus/docs/jira-xray.md","tags":[],"version":"current","frontMatter":{},"sidebar":"docs","previous":{"title":"CI/CD\\\\nSet up GitHub Actions and Jenkins.","permalink":"/playwright-framework/docs/docusaurus/docs/ci-cd"},"next":{"title":"CLI\\\\nUse Error: No tests found to execute tests.","permalink":"/playwright-framework/docs/docusaurus/docs/cli"}}'
      );
      var n = r(4848),
        s = r(8453);
      const o = {},
        c = 'Jira/Xray\nIntegrate with Xray for test management.',
        i = {},
        u = [];
      function d(t) {
        const e = { h1: 'h1', header: 'header', ...(0, s.R)(), ...t.components };
        return (0, n.jsx)(e.header, {
          children: (0, n.jsx)(e.h1, {
            id: 'jiraxraynintegrate-with-xray-for-test-management',
            children: 'Jira/Xray\\nIntegrate with Xray for test management.'
          })
        });
      }
      function m(t = {}) {
        const { wrapper: e } = { ...(0, s.R)(), ...t.components };
        return e ? (0, n.jsx)(e, { ...t, children: (0, n.jsx)(d, { ...t }) }) : d(t);
      }
    },
    8453: (t, e, r) => {
      r.d(e, { R: () => o, x: () => c });
      var a = r(6540);
      const n = {},
        s = a.createContext(n);
      function o(t) {
        const e = a.useContext(s);
        return a.useMemo(
          function () {
            return 'function' == typeof t ? t(e) : { ...e, ...t };
          },
          [e, t]
        );
      }
      function c(t) {
        let e;
        return (
          (e = t.disableParentContext
            ? 'function' == typeof t.components
              ? t.components(n)
              : t.components || n
            : o(t.components)),
          a.createElement(s.Provider, { value: e }, t.children)
        );
      }
    }
  }
]);
