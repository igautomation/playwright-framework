import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'UI Testing',
    description: (
      <>
        Comprehensive UI testing with Page Object Model, self-healing locators,
        and reusable web interactions.
      </>
    ),
  },
  {
    title: 'API Testing',
    description: (
      <>
        Robust API testing with POJO models, REST and GraphQL support, and
        dynamic test data generation.
      </>
    ),
  },
  {
    title: 'E2E Testing',
    description: (
      <>
        End-to-end testing combining UI and API interactions for complete
        workflow validation.
      </>
    ),
  },
  {
    title: 'Test Data Factory',
    description: (
      <>
        Generate dynamic test data for UI and API tests with realistic values
        for various scenarios.
      </>
    ),
  },
  {
    title: 'Reporting',
    description: (
      <>
        Comprehensive reporting with Allure, HTML, and JSON formats, including
        screenshots and traces.
      </>
    ),
  },
  {
    title: 'CI/CD Integration',
    description: (
      <>
        Seamless integration with CI/CD pipelines using GitHub Actions and
        Jenkins for automated testing.
      </>
    ),
  },
];

function Feature({ title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
