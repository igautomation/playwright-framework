'use strict';
(self.webpackChunkplaywright_framework_docs =
  self.webpackChunkplaywright_framework_docs || []).push([
  [61],
  {
    9181: (e, a, s) => {
      s.r(a), s.d(a, { default: () => g });
      s(6540);
      var t = s(4164),
        r = s(1769),
        d = s(204),
        l = s(1410),
        i = s(4522),
        c = s(7959),
        n = s(8467),
        o = s(1708);
      const m = { mdxPageWrapper: 'mdxPageWrapper_j9I6' };
      var p = s(4848);
      function g(e) {
        const { content: a } = e,
          { metadata: s, assets: g } = a,
          {
            title: x,
            editUrl: h,
            description: j,
            frontMatter: _,
            lastUpdatedBy: w,
            lastUpdatedAt: A
          } = s,
          { keywords: v, wrapperClassName: f, hide_table_of_contents: k } = _,
          u = g.image ?? _.image,
          N = !!(h || A || w);
        return (0, p.jsx)(r.e3, {
          className: (0, t.A)(f ?? d.G.wrapper.mdxPages, d.G.page.mdxPage),
          children: (0, p.jsxs)(l.A, {
            children: [
              (0, p.jsx)(r.be, { title: x, description: j, keywords: v, image: u }),
              (0, p.jsx)('main', {
                className: 'container container--fluid margin-vert--lg',
                children: (0, p.jsxs)('div', {
                  className: (0, t.A)('row', m.mdxPageWrapper),
                  children: [
                    (0, p.jsxs)('div', {
                      className: (0, t.A)('col', !k && 'col--8'),
                      children: [
                        (0, p.jsx)(n.A, { metadata: s }),
                        (0, p.jsx)('article', {
                          children: (0, p.jsx)(i.A, { children: (0, p.jsx)(a, {}) })
                        }),
                        N &&
                          (0, p.jsx)(o.A, {
                            className: (0, t.A)('margin-top--sm', d.G.pages.pageFooterEditMetaRow),
                            editUrl: h,
                            lastUpdatedAt: A,
                            lastUpdatedBy: w
                          })
                      ]
                    }),
                    !k &&
                      a.toc.length > 0 &&
                      (0, p.jsx)('div', {
                        className: 'col col--2',
                        children: (0, p.jsx)(c.A, {
                          toc: a.toc,
                          minHeadingLevel: _.toc_min_heading_level,
                          maxHeadingLevel: _.toc_max_heading_level
                        })
                      })
                  ]
                })
              })
            ]
          })
        });
      }
    }
  }
]);
