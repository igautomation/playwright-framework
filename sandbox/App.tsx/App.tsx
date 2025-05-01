// src/App.tsx

import React from "react";
import {
  Terminal,
  Code2,
  TerminalSquare,
  GitBranch,
  PlayCircle,
  Layers,
  FileSearch,
  CheckCircle2,
} from "lucide-react";

function App() {
  const frameworkName = "Enterprise Playwright Framework";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <header className="py-6 px-4 md:px-8 lg:px-16">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-8 h-8 text-emerald-400" />
            <span className="text-xl font-bold">{frameworkName}</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            {["Features", "Architecture", "Usage", "Reports"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="hover:text-emerald-400 transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-md transition-colors">
            Get Started
          </button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-16 px-4 md:px-8 lg:px-16 text-center">
          <div className="container mx-auto max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {frameworkName}
            </h1>
            <p className="text-gray-300 text-lg mb-10">
              A production-grade Playwright framework for Web UI, API, Hybrid, CI/CD, and Xray integration. Built for Enterprise Quality Engineering.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-8 rounded-md flex items-center gap-2 transition-colors">
                <PlayCircle className="w-5 h-5" />
                Run Tests
              </button>
              <button className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-8 rounded-md flex items-center gap-2 transition-colors">
                <Code2 className="w-5 h-5" />
                View Code
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 px-4 md:px-8 lg:px-16 bg-gray-800/50">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-12">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Layers className="w-10 h-10 text-emerald-400" />,
                  title: "Page Object Model",
                  description: "Clean POM for UI automation across any platform",
                },
                {
                  icon: <TerminalSquare className="w-10 h-10 text-emerald-400" />,
                  title: "API Testing",
                  description: "Powerful REST/GraphQL API testing with POJO models",
                },
                {
                  icon: <GitBranch className="w-10 h-10 text-emerald-400" />,
                  title: "CI/CD Ready",
                  description: "Built-in GitHub Actions and Jenkins support",
                },
                {
                  icon: <FileSearch className="w-10 h-10 text-emerald-400" />,
                  title: "Xray/Jira Integration",
                  description: "Full test case management with Xray Cloud",
                },
                {
                  icon: <CheckCircle2 className="w-10 h-10 text-emerald-400" />,
                  title: "Smart Automation",
                  description: "Retries, flaky detection, self-healing locators",
                },
                {
                  icon: <Terminal className="w-10 h-10 text-emerald-400" />,
                  title: "Multi-Environment",
                  description: "Run tests easily across Dev, QA, UAT, Prod",
                },
              ].map((feature, index) => (
                <div key={feature.title} className="bg-gray-800 p-6 rounded-lg hover:shadow-md hover:shadow-emerald-900/30 transition-all">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ... rest sections (Architecture, Usage, Reports, Footer) unchanged except replacing hardcoded names */}
      </main>

      <footer className="bg-gray-900 py-12 px-4 md:px-8 lg:px-16">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Terminal className="w-6 h-6 text-emerald-400" />
            <span className="text-lg font-bold">{frameworkName}</span>
          </div>
          <div className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} - Enterprise Automation Framework | MIT License
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;