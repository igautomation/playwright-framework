<!-- Source: /Users/mzahirudeen/playwright-framework/sandbox/README.md -->

# 🧪 Sandbox

This folder is used for **internal testing, demos, and experimentation** that are not part of the core test automation framework.

---

## Purpose

- Host demo components like `App.tsx`, `main.tsx`, `index.css`
- Try out new test utilities or integrations before adding them to the framework
- Support visual testing previews or isolated development of utilities

---

## Important Notes

- Code in this folder **is not loaded** or required by the `framework` CLI.
- This folder is ignored by versioned builds and CI pipelines.
- Do not place critical tests or configuration files here.

---

## Examples of what's inside

- UI demo apps (React, Next.js, etc.)
- Mock APIs or UI widgets
- Preview pages for locator validation

---

## Git Ignore

The following are excluded from version control:

- `sandbox/dist/`, `sandbox/build/`
- `sandbox/node_modules/`
- `sandbox/.env`
- Temp and log files

You can safely use this folder for any experimental development without affecting the reusable Playwright automation framework.
