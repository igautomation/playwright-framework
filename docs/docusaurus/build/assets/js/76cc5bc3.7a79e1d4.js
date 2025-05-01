'use strict';
(self.webpackChunkplaywright_framework_docs =
  self.webpackChunkplaywright_framework_docs || []).push([
  [141],
  {
    2713: (n, o, t) => {
      t.r(o),
        t.d(o, {
          assets: () => c,
          contentTitle: () => a,
          default: () => f,
          frontMatter: () => i,
          metadata: () => r,
          toc: () => u
        });
      const r = JSON.parse(
        '{"id":"docusaurus/docs/configuration","title":"Configuration\\\\nConfigure  and .","description":"","source":"@site/docs/docusaurus/docs/configuration.md","sourceDirName":"docusaurus/docs","slug":"/docusaurus/docs/configuration","permalink":"/playwright-framework/docs/docusaurus/docs/configuration","draft":false,"unlisted":false,"editUrl":"https://github.com/igautomation/playwright-framework/edit/main/docs/docs/docusaurus/docs/configuration.md","tags":[],"version":"current","frontMatter":{},"sidebar":"docs","previous":{"title":"Installation\\\\nInstall with .","permalink":"/playwright-framework/docs/docusaurus/docs/installation"},"next":{"title":"Writing Tests\\\\nUse POM for UI and POJOs for API.","permalink":"/playwright-framework/docs/docusaurus/docs/writing-tests"}}'
      );
      var e = t(4848),
        s = t(8453);
      const i = {},
        a = 'Configuration\nConfigure  and .',
        c = {},
        u = [];
      function d(n) {
        const o = { h1: 'h1', header: 'header', ...(0, s.R)(), ...n.components };
        return (0, e.jsx)(o.header, {
          children: (0, e.jsx)(o.h1, {
            id: 'configurationnconfigure--and-',
            children: 'Configuration\\nConfigure  and .'
          })
        });
      }
      function f(n = {}) {
        const { wrapper: o } = { ...(0, s.R)(), ...n.components };
        return o ? (0, e.jsx)(o, { ...n, children: (0, e.jsx)(d, { ...n }) }) : d(n);
      }
    },
    8453: (n, o, t) => {
      t.d(o, { R: () => i, x: () => a });
      var r = t(6540);
      const e = {},
        s = r.createContext(e);
      function i(n) {
        const o = r.useContext(s);
        return r.useMemo(
          function () {
            return 'function' == typeof n ? n(o) : { ...o, ...n };
          },
          [o, n]
        );
      }
      function a(n) {
        let o;
        return (
          (o = n.disableParentContext
            ? 'function' == typeof n.components
              ? n.components(e)
              : n.components || e
            : i(n.components)),
          r.createElement(s.Provider, { value: o }, n.children)
        );
      }
    }
  }
]);
