'use strict';
(self.webpackChunkplaywright_framework_docs =
  self.webpackChunkplaywright_framework_docs || []).push([
  [98],
  {
    7419: (n, e, r) => {
      r.r(e), r.d(e, { default: () => d });
      r(6540);
      var s = r(1769);
      function o(n, e) {
        return `docs-${n}-${e}`;
      }
      var t = r(1858),
        c = r(2831),
        i = r(7220),
        a = r(4848);
      function u(n) {
        const { version: e } = n;
        return (0, a.jsxs)(a.Fragment, {
          children: [
            (0, a.jsx)(i.A, { version: e.version, tag: o(e.pluginId, e.version) }),
            (0, a.jsx)(s.be, {
              children:
                e.noIndex && (0, a.jsx)('meta', { name: 'robots', content: 'noindex, nofollow' })
            })
          ]
        });
      }
      function l(n) {
        const { version: e, route: r } = n;
        return (0, a.jsx)(s.e3, {
          className: e.className,
          children: (0, a.jsx)(t.n, { version: e, children: (0, c.v)(r.routes) })
        });
      }
      function d(n) {
        return (0, a.jsxs)(a.Fragment, {
          children: [(0, a.jsx)(u, { ...n }), (0, a.jsx)(l, { ...n })]
        });
      }
    }
  }
]);
