import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/playwright-framework/__docusaurus/debug',
    component: ComponentCreator('/playwright-framework/__docusaurus/debug', '657'),
    exact: true
  },
  {
    path: '/playwright-framework/__docusaurus/debug/config',
    component: ComponentCreator('/playwright-framework/__docusaurus/debug/config', '0a4'),
    exact: true
  },
  {
    path: '/playwright-framework/__docusaurus/debug/content',
    component: ComponentCreator('/playwright-framework/__docusaurus/debug/content', '35a'),
    exact: true
  },
  {
    path: '/playwright-framework/__docusaurus/debug/globalData',
    component: ComponentCreator('/playwright-framework/__docusaurus/debug/globalData', '6ed'),
    exact: true
  },
  {
    path: '/playwright-framework/__docusaurus/debug/metadata',
    component: ComponentCreator('/playwright-framework/__docusaurus/debug/metadata', 'e1c'),
    exact: true
  },
  {
    path: '/playwright-framework/__docusaurus/debug/registry',
    component: ComponentCreator('/playwright-framework/__docusaurus/debug/registry', '848'),
    exact: true
  },
  {
    path: '/playwright-framework/__docusaurus/debug/routes',
    component: ComponentCreator('/playwright-framework/__docusaurus/debug/routes', '72e'),
    exact: true
  },
  {
    path: '/playwright-framework/docs',
    component: ComponentCreator('/playwright-framework/docs', '4fa'),
    routes: [
      {
        path: '/playwright-framework/docs',
        component: ComponentCreator('/playwright-framework/docs', '6f8'),
        routes: [
          {
            path: '/playwright-framework/docs',
            component: ComponentCreator('/playwright-framework/docs', '8cf'),
            routes: [
              {
                path: '/playwright-framework/docs/docusaurus/docs/ci-cd',
                component: ComponentCreator(
                  '/playwright-framework/docs/docusaurus/docs/ci-cd',
                  'e87'
                ),
                exact: true,
                sidebar: 'docs'
              },
              {
                path: '/playwright-framework/docs/docusaurus/docs/cli',
                component: ComponentCreator(
                  '/playwright-framework/docs/docusaurus/docs/cli',
                  'bcb'
                ),
                exact: true,
                sidebar: 'docs'
              },
              {
                path: '/playwright-framework/docs/docusaurus/docs/configuration',
                component: ComponentCreator(
                  '/playwright-framework/docs/docusaurus/docs/configuration',
                  'af4'
                ),
                exact: true,
                sidebar: 'docs'
              },
              {
                path: '/playwright-framework/docs/docusaurus/docs/extending',
                component: ComponentCreator(
                  '/playwright-framework/docs/docusaurus/docs/extending',
                  '0a7'
                ),
                exact: true,
                sidebar: 'docs'
              },
              {
                path: '/playwright-framework/docs/docusaurus/docs/installation',
                component: ComponentCreator(
                  '/playwright-framework/docs/docusaurus/docs/installation',
                  '8ee'
                ),
                exact: true,
                sidebar: 'docs'
              },
              {
                path: '/playwright-framework/docs/docusaurus/docs/intro',
                component: ComponentCreator(
                  '/playwright-framework/docs/docusaurus/docs/intro',
                  'ee9'
                ),
                exact: true,
                sidebar: 'docs'
              },
              {
                path: '/playwright-framework/docs/docusaurus/docs/jira-xray',
                component: ComponentCreator(
                  '/playwright-framework/docs/docusaurus/docs/jira-xray',
                  'e58'
                ),
                exact: true,
                sidebar: 'docs'
              },
              {
                path: '/playwright-framework/docs/docusaurus/docs/page-objects',
                component: ComponentCreator(
                  '/playwright-framework/docs/docusaurus/docs/page-objects',
                  '97a'
                ),
                exact: true,
                sidebar: 'docs'
              },
              {
                path: '/playwright-framework/docs/docusaurus/docs/pojos',
                component: ComponentCreator(
                  '/playwright-framework/docs/docusaurus/docs/pojos',
                  '2f1'
                ),
                exact: true,
                sidebar: 'docs'
              },
              {
                path: '/playwright-framework/docs/docusaurus/docs/utilities',
                component: ComponentCreator(
                  '/playwright-framework/docs/docusaurus/docs/utilities',
                  'f8c'
                ),
                exact: true,
                sidebar: 'docs'
              },
              {
                path: '/playwright-framework/docs/docusaurus/docs/writing-tests',
                component: ComponentCreator(
                  '/playwright-framework/docs/docusaurus/docs/writing-tests',
                  '541'
                ),
                exact: true,
                sidebar: 'docs'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/playwright-framework/',
    component: ComponentCreator('/playwright-framework/', '772'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*')
  }
];
