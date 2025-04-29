// src/tests/ui/smoke/demo-smoke.spec.js
import { test, expect } from '../../fixtures/combined.js';
import HomePage from '../../../pages/HomePage.js';

test('@smoke Home Page Title', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.verifyPageTitle();
});
