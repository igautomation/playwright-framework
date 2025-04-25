import React from 'react';
import { Terminal, Code2, TerminalSquare, GitBranch, PlayCircle, Layers, FileSearch, CheckCircle2 } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <header className="py-6 px-4 md:px-8 lg:px-16">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="w-8 h-8 text-emerald-400" />
              <span className="text-xl font-bold">Salesforce Test Framework</span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
              <a href="#architecture" className="hover:text-emerald-400 transition-colors">Architecture</a>
              <a href="#usage" className="hover:text-emerald-400 transition-colors">Usage</a>
              <a href="#reports" className="hover:text-emerald-400 transition-colors">Reports</a>
            </nav>
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-md transition-colors">
              Get Started
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-16 px-4 md:px-8 lg:px-16">
          <div className="container mx-auto">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Salesforce Test Automation Framework
              </h1>
              <p className="text-gray-300 text-lg mb-10">
                A comprehensive, production-grade end-to-end test automation solution for Salesforce 
                applications with Playwright, Jira integration, and CI/CD support.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button className="bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-8 rounded-md transition-colors flex items-center gap-2">
                  <PlayCircle className="w-5 h-5" />
                  Run Tests
                </button>
                <button className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-8 rounded-md transition-colors flex items-center gap-2">
                  <Code2 className="w-5 h-5" />
                  View Code
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 px-4 md:px-8 lg:px-16 bg-gray-800/50">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Layers className="w-10 h-10 text-emerald-400" />,
                  title: "Page Object Model",
                  description: "Well-structured page objects for Salesforce UI components and screens"
                },
                {
                  icon: <TerminalSquare className="w-10 h-10 text-emerald-400" />,
                  title: "API Integration",
                  description: "Comprehensive API testing capabilities with Salesforce REST API"
                },
                {
                  icon: <GitBranch className="w-10 h-10 text-emerald-400" />,
                  title: "CI/CD Pipeline",
                  description: "Ready-to-use GitHub Actions workflow for continuous testing"
                },
                {
                  icon: <FileSearch className="w-10 h-10 text-emerald-400" />,
                  title: "Jira/Xray Integration",
                  description: "Fetch test cases and report results back to your Jira projects"
                },
                {
                  icon: <CheckCircle2 className="w-10 h-10 text-emerald-400" />,
                  title: "Smart Test Handling",
                  description: "Retry logic, flaky test detection, and self-healing locators"
                },
                {
                  icon: <Terminal className="w-10 h-10 text-emerald-400" />,
                  title: "Multi-Environment",
                  description: "Run tests across dev, QA, UAT, and production environments"
                }
              ].map((feature, index) => (
                <div key={index} className="bg-gray-800 p-6 rounded-lg hover:shadow-md hover:shadow-emerald-900/30 transition-all">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Architecture Section */}
        <section id="architecture" className="py-16 px-4 md:px-8 lg:px-16">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Framework Architecture</h2>
            <div className="bg-gray-800 p-8 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-700 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4 text-emerald-400">Test Layer</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• UI Tests</li>
                    <li>• API Tests</li>
                    <li>• Hybrid Tests</li>
                    <li>• Data-Driven Tests</li>
                  </ul>
                </div>
                <div className="bg-gray-700 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4 text-emerald-400">Framework Layer</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• Page Objects</li>
                    <li>• API Clients</li>
                    <li>• Test Utilities</li>
                    <li>• Reporting Engine</li>
                  </ul>
                </div>
                <div className="bg-gray-700 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4 text-emerald-400">Integration Layer</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• Jira/Xray Connector</li>
                    <li>• CI/CD Pipeline</li>
                    <li>• Notification System</li>
                    <li>• Environment Manager</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Usage Example Section */}
        <section id="usage" className="py-16 px-4 md:px-8 lg:px-16 bg-gray-800/50">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Usage Examples</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">UI Test Example</h3>
                <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm text-gray-300">
{`/**
 * @fileoverview Tests for Salesforce login
 */
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage.js';

test('should login successfully @smoke @ui', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.loginWithEnvCredentials();
  
  // Verify successful login
  const userMenu = page.locator('.userMenu');
  await expect(userMenu).toBeVisible();
});`}
                  </code>
                </pre>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4">API Test Example</h3>
                <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm text-gray-300">
{`/**
 * @fileoverview Tests for Salesforce API
 */
import { test, expect } from '@playwright/test';
import { createSalesforceApiContext } from '../../utils/auth.js';

test('should create contact record @api', async () => {
  const apiContext = await createSalesforceApiContext();
  const contactData = {
    FirstName: 'API',
    LastName: 'Test',
    Email: \`test-\${Date.now()}@example.com\`
  };
  
  const response = await apiContext.post(
    '/services/data/v58.0/sobjects/Contact', 
    { data: contactData }
  );
  
  expect(response.status()).toBe(201);
  const result = await response.json();
  expect(result.success).toBe(true);
});`}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Reports Section */}
        <section id="reports" className="py-16 px-4 md:px-8 lg:px-16">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Reporting & Insights</h2>
            
            <div className="bg-gray-800 p-6 rounded-lg mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-700 p-4 rounded-lg text-center">
                  <h3 className="text-2xl font-bold text-emerald-400">94%</h3>
                  <p className="text-gray-300">Pass Rate</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg text-center">
                  <h3 className="text-2xl font-bold text-emerald-400">127</h3>
                  <p className="text-gray-300">Total Tests</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg text-center">
                  <h3 className="text-2xl font-bold text-emerald-400">2.5m</h3>
                  <p className="text-gray-300">Avg Duration</p>
                </div>
              </div>
              
              <div className="bg-gray-900 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Test Execution Timeline</h3>
                <div className="h-24 flex items-end space-x-1">
                  {[65, 72, 80, 94, 85, 90, 94, 88, 92, 95, 97, 94].map((height, i) => (
                    <div 
                      key={i} 
                      className="bg-emerald-500 rounded-t w-full" 
                      style={{ height: `${height}%` }}
                    ></div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <span>May</span>
                  <span>Jun</span>
                  <span>Jul</span>
                  <span>Aug</span>
                  <span>Sep</span>
                  <span>Oct</span>
                  <span>Nov</span>
                  <span>Dec</span>
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <button className="bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-8 rounded-md transition-colors">
                View Detailed Reports
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 py-12 px-4 md:px-8 lg:px-16">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Terminal className="w-6 h-6 text-emerald-400" />
              <span className="text-lg font-bold">Salesforce Test Framework</span>
            </div>
            <div className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} - Enterprise Test Automation | MIT License
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;