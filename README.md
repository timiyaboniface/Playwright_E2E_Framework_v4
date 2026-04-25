# Playwright E2E Framework

![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen?logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Playwright](https://img.shields.io/badge/Playwright-1.44%2B-orange?logo=playwright)
![Cucumber](https://img.shields.io/badge/Cucumber-BDD-green?logo=cucumber)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

> Enterprise-ready End-to-End (E2E) test automation framework using **Playwright + TypeScript + Cucumber (BDD)** with OOP architecture, data-driven testing, lifecycle hooks, and rich HTML reporting.

---

## Table of Contents

1. [What This Framework Is For](#1-what-this-framework-is-for)
2. [Prerequisites](#2-prerequisites-and-why-they-are-needed)
3. [Getting Started (Clone & Run)](#3-getting-started-clone--run)
4. [Git Workflow — Push & Pull](#4-git-workflow--push--pull)
5. [Create Framework Folder From Scratch](#5-create-framework-folder-from-scratch)
6. [Initial Setup Steps](#6-initial-setup-steps-from-scratch)
7. [High-Level Framework Architecture](#7-high-level-framework-architecture)
8. [Project Structure](#8-project-structure-and-file-usage)
9. [OOP Concepts](#9-oop-concepts-incorporated-in-this-framework)
10. [Hooks Design](#10-hooks-design-and-why-it-matters)
11. [Configuration Strategy](#11-configuration-strategy)
12. [Spreadsheet / Data-Driven Testing](#12-spreadsheet-data-driven-testing)
13. [Reports, Logs, and Screenshots](#13-reports-logs-and-screenshots)
14. [Run Commands](#14-run-commands-current-project)
15. [Recommended Workflow for New Users](#15-recommended-workflow-for-new-users)
16. [Framework Quality and Benefits](#16-framework-quality-and-benefits-summary)
17. [Troubleshooting](#17-common-troubleshooting-tips)
18. [Quick Start](#18-quick-start-commands)
19. [GitHub Actions CI/CD Setup](#19-github-actions-cicd-setup)

---

## 1. What This Framework Is For

This framework helps teams test web applications from a real user perspective:
- Login and session validation
- Cart and checkout journeys
- Validation and negative scenarios
- Browser compatibility checks
- Regression and smoke automation in CI

It is designed to be:
- Easy for new team members to onboard
- Scalable for large test suites
- Maintainable through Page Object Model and OOP principles
- Auditable through logs, screenshots, and reports

## 2. Prerequisites and Why They Are Needed

1. Node.js (18+)
Purpose: Runtime for JavaScript/TypeScript tooling and npm packages.

2. npm (comes with Node.js)
Purpose: Dependency and script management.

3. Visual Studio Code (recommended)
Purpose: Authoring feature files, step definitions, and debugging.

4. Git (recommended)
Purpose: Version control, branching, CI integration.

5. Playwright browser binaries
Purpose: Actual browser engines used to execute UI automation.

Recommended VS Code extensions:
- Cucumber (Gherkin) Full Support
- Playwright Test for VS Code
- ESLint
- Prettier

## 3. Getting Started (Clone & Run)

Use these steps if the repository already exists on GitHub.

### Clone the repository

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

### Install dependencies

```bash
npm install
npm run install:browsers
```

### Run smoke suite to validate setup

```bash
npm run test:headed:smoke
```

---

## 4. Git Workflow — Push & Pull

### First-time push (new local project → GitHub)

```powershell
# 1. Navigate to the project folder
cd "C:\Playwright Temp framework\Playwright_E2E_Framework"

# 2. Initialize a local Git repository
git init

# 3. Stage all files (node_modules, reports are already excluded via .gitignore)
git add .

# 4. Create the first commit
git commit -m "Initial commit: Playwright E2E BDD framework"

# 5. Add the remote repository (create an empty repo on GitHub first)
git remote add origin https://github.com/<your-username>/<repo-name>.git

Example: git remote add origin https://github.com/ANREMS/Playwright_E2E_Framework.git

# 6. Rename branch to main and push
git branch -M main
git push -u origin main
```

> **SSH alternative:** replace the HTTPS URL with `git@github.com:<your-username>/<repo-name>.git`

---

### Daily workflow (pull → code → push)

```bash
# Pull latest changes before you start
git pull origin main

# Check what files changed
git status

# Stage your changes
git add .

# Commit with a meaningful message
git commit -m "feat: add checkout page tests"

# Push to remote
git push origin main
```

### Useful Git commands

| Command | Purpose |
|---|---|
| `git status` | See modified/staged files |
| `git log --oneline` | View condensed commit history |
| `git diff` | See unstaged changes |
| `git fetch origin` | Download remote changes without merging |
| `git branch -a` | List all local and remote branches |
| `git checkout -b feature/my-branch` | Create and switch to a new branch |
| `git stash` | Temporarily shelve uncommitted changes |
| `git stash pop` | Restore shelved changes |

---

## 5. Create Framework Folder (Example: E2E_Framework_v2)

> Skip this section if you cloned the repository using the steps above.

### Windows (PowerShell)

```powershell
mkdir "C:\Automation\E2E_Framework_v2"
Set-Location "C:\Automation\E2E_Framework_v2"
```

### macOS/Linux

```bash
mkdir -p ~/Automation/E2E_Framework_v2
cd ~/Automation/E2E_Framework_v2
```

git clone https://github.com/ANREMS/Playwright_E2E_Framework.git

Copy this project source into that folder, or clone your repository there.

## 6. Initial Setup Steps (From Scratch)

1. Install dependencies

```bash
Place the package.jason in the folder and then 
npm install
```

2. Install Playwright browsers

```bash
npm run install:browsers
```

3. Review environment defaults in `.env`

Typical values:
- `BROWSER=chromium`
- `HEADLESS=true`
- `BASE_URL=https://www.saucedemo.com`
- `DEFAULT_TIMEOUT=30000`

4. Confirm project compiles and test runner is available

```bash
npm test -- --dry-run
```

## 7. High-Level Framework Architecture

Flow:
1. `.feature` files define behavior in business language
2. Step definitions map those steps to automation actions
3. Hooks handle setup/teardown and failure attachments
4. World object stores scenario state and shared objects
5. Page Objects encapsulate selectors and UI operations
6. Config manager controls runtime values from env/data
7. Data reader loads scenario-specific input from spreadsheet
8. Report generator builds human-readable execution output

## 8. Project Structure and File Usage

```text
Playwright_E2E_Framework/
|-- .env
|-- cucumber.json
|-- package.json
|-- tsconfig.json
|-- README.md
|
|-- features/
|   |-- saucedemo-e2e.feature
|   |-- step-definitions/
|   |   |-- common.steps.ts
|   |   |-- login.steps.ts
|   |   |-- cart.steps.ts
|   |   `-- checkout.steps.ts
|   `-- support/
|       |-- hooks.ts
|       `-- world.ts
|
|-- src/
|   |-- config/
|   |   `-- config.manager.ts
|   |-- pages/
|   |   |-- base.page.ts
|   |   |-- login.page.ts
|   |   |-- inventory.page.ts
|   |   |-- cart.page.ts
|   |   |-- checkout-info.page.ts
|   |   |-- checkout-overview.page.ts
|   |   |-- checkout-complete.page.ts
|   |   `-- page.factory.ts
|   |-- types/
|   `-- utils/
|       |-- excel.reader.ts
|       |-- logger.ts
|       |-- retry.helper.ts
|       `-- screenshot.helper.ts
|
|-- scripts/
|   |-- runCucumber.js
|   |-- runParallel.js
|   `-- generateReport.js
|
|-- test-data/
|   |-- test-data.xlsx
|   `-- E2E_Tests-template.csv
|
`-- reports/
    |-- cucumber-report.json
    |-- html/
    `-- screenshots/
```

### What each main area does

1. `features/`
Use: Business-readable tests in Gherkin + binding code.

2. `features/support/world.ts`
Use: Scenario-level shared state (browser/page/data/context objects).

3. `features/support/hooks.ts`
Use: Lifecycle automation (`Before`, `After`, `BeforeAll`, `AfterAll`).

4. `src/pages/`
Use: Page Object Model implementation for UI actions and assertions.

5. `src/config/config.manager.ts`
Use: Centralized runtime config with default + override logic.

6. `src/utils/`
Use: Common utilities (screenshots, logging, retries, data readers).

7. `scripts/`
Use: Execution wrappers and report generation.

8. `test-data/`
Use: Spreadsheet-driven test data to avoid hardcoded values.

9. `reports/`
Use: JSON + HTML + screenshot artifacts for debugging and auditing.

## 9. OOP Concepts Incorporated in This Framework

1. Encapsulation
Where: Page classes keep locators/actions internal.
Benefit: Test steps remain clean and business-focused.

2. Inheritance
Where: All pages extend a shared base page.
Benefit: Reuse common waits, navigation, and helper methods.

3. Abstraction
Where: Base page and interfaces hide implementation details.
Benefit: Step definitions call clear methods without low-level noise.

4. Singleton
Where: Config manager exposes one shared instance.
Benefit: Consistent runtime behavior across scenario objects.

5. Factory Pattern
Where: Page factory creates/returns page objects.
Benefit: Standardized object creation and reduced duplication.

6. Strategy-like utility behavior
Where: Retry and runtime control logic in utilities.
Benefit: Flexible execution tuning without changing test logic.

## 10. Hooks Design and Why It Matters

Typical hooks in this framework:
- `BeforeAll`: Suite setup and report folder preparation
- `Before`: New browser/page/world setup per scenario
- `After`: Failure screenshot attach + cleanup
- `AfterAll`: Suite finalization and logger/report completion

Benefits:
- Strong test isolation
- Better failure diagnostics
- No stale browser/session leakage between scenarios

## 11. Configuration Strategy

Configuration precedence (highest to lowest):
1. Spreadsheet row values (per test data row)
2. CLI/env overrides at runtime
3. `.env` defaults

This allows:
- Stable defaults for local runs
- Quick one-off overrides for troubleshooting
- Data-driven variation without source code edits

## 12. Spreadsheet (Data-Driven Testing)

Input file examples:
- `test-data/test-data.xlsx`
- `test-data/E2E_Tests-template.csv`

Typical columns:
- `testId`
- `active`
- `browser`
- `headless`
- `username`
- `password`
- `productName`
- `firstName`
- `lastName`
- `postalCode`

Benefits:
- Business users can contribute data without coding
- Broad coverage with minimal step-definition growth
- Easier maintenance of credentials/test combinations

## 13. Reports, Logs, and Screenshots

Generated artifacts:
- JSON result: `reports/cucumber-report.json`
- HTML report: `reports/html/`
- Screenshots: `reports/screenshots/`
- Execution logs: framework logger output

Why this is important:
- Faster root-cause analysis
- Better test evidence for stakeholders
- Easier defect reproduction and triage

## 14. Run Commands (Current Project)

### Run full suite

```bash
npm test
```

### Run only a tag

PowerShell-safe style:

```bash
npm test -- smoke
npm test -- regression
npm test -- sanity
```

`@tag` style (quote in PowerShell):

```bash
npm test -- '@regression'
```

### Run headed

```bash
npm run test:headed
npm run test:headed:smoke
npm run test:headed:regression
npm run test:headed:sanity
```

### Run smoke with explicit headless override

```bash
npm run test:smoke -- --Headless=false
```

Note: In npm scripts, pass runtime arguments after `--` so they are forwarded correctly.

### Dry run (validate scenario selection without execution)

```bash
npm run test:headed:sanity -- --dry-run
```

### Generate report

```bash
npm run report
```

## 15. Recommended Workflow for New Users

1. Pull latest code and install dependencies
2. Run a dry run with target tag
3. Run headed smoke once to validate setup
4. Execute regression in headless mode
5. Generate and review reports
6. Attach report and screenshots to defects if failures occur

## 16. Framework Quality and Benefits Summary

1. Maintainability
Clear layer separation and reusable page objects.

2. Scalability
Tagging + data-driven design supports large suites.

3. Reliability
Hooks + config resets reduce flaky state leakage.

4. Traceability
Rich logs, screenshots, and report artifacts.

5. Team Productivity
Readable BDD + spreadsheet inputs help QA, dev, and product collaborate.

6. CI/CD Readiness
Scripted runners and deterministic reporting integrate cleanly in pipelines.

## 17. Common Troubleshooting Tips

1. Tag not filtering as expected
Use `npm test -- regression` or quote `@tag` in PowerShell.

2. Override not applied
Ensure args are passed after `--` in npm scripts.

3. Browser still headless
Check effective env in runner output (`Env overrides`) and spreadsheet `headless` values.

4. Missing report output
Run `npm run report` after test execution.

5. No scenarios found
Verify `.feature` tags and `cucumber.json` paths.

## 18. Quick Start Commands

```bash
npm install
npm run install:browsers
npm run test:headed:smoke
npm run report
```

---

If you want, the next step can be adding a CI-ready section (GitHub Actions or Azure DevOps) with a ready-to-use pipeline file for this framework.

## 19. GitHub Actions CI/CD Setup

This project now includes a ready workflow at `.github/workflows/e2e-tests.yml`.

### What the workflow does

1. Triggers on push and pull request for `main` and `master`
2. Supports manual run using `workflow_dispatch`
3. Installs Node dependencies using `npm ci`
4. Installs Playwright browsers on the runner
5. Runs selected suite (`smoke`, `regression`, or `sanity`) in headless mode
6. Generates HTML report after test execution
7. Uploads `reports/` as a downloadable artifact

### Workflow location

- `.github/workflows/e2e-tests.yml`

### Manual run from GitHub UI

1. Open repository in GitHub
2. Go to Actions tab
3. Select workflow: E2E Tests (Playwright + Cucumber)
4. Click Run workflow
5. Choose suite input: `smoke`, `regression`, or `sanity`
6. Start run and download artifact when complete

### Trigger behavior

- Push/PR: defaults to `smoke` suite
- Manual run: uses the selected suite input

### Recommended branch protection usage

1. Mark this workflow as required for pull requests
2. Keep smoke suite fast for quick quality gate
3. Run regression nightly using a separate scheduled workflow (optional)

### Example extension: nightly regression

To run nightly regression, add this trigger block under `on:` in workflow:

```yaml
    schedule:
        - cron: '0 1 * * *'
```

Then update suite selection logic for scheduled events to default to `regression`.

### CI benefits for this framework

1. Early defect detection on every code change
2. Consistent environment for stable execution
3. Traceable test evidence via artifacted reports/screenshots
4. Faster release confidence through automated quality gates
