# Playwright Onboarding Automation

Automation framework built using Playwright for End-to-End (E2E) testing to validate onboarding user flows and critical application functionality.

## 🚀 Tech Stack

- Playwright
- JavaScript / TypeScript
- Node.js
- Page Object Model (POM)
- HTML Reports
- Playwright Test Runner

---

## 📂 Project Structure

```
playwright-onboarding-automation/
│
├── tests/                  # Test files
├── pages/                  # Page Object Models
├── utils/                  # Utility/helper functions
├── fixtures/               # Test fixtures
├── test-data/              # Test data files
├── screenshots/            # Failure screenshots
├── reports/                # HTML reports
├── playwright.config.js    # Playwright configuration
├── package.json
└── README.md
```

---

## ⚙️ Prerequisites

Install the following before running the framework:

- Node.js (v18+ recommended)
- npm
- Git

Verify installation:

```bash
node -v
npm -v
git --version
```

---

## 📥 Clone Repository

```bash
git clone https://github.com/Nihal1610/playwright-onboarding-automation.git
```

Move into project folder:

```bash
cd playwright-onboarding-automation
```

---

## 📦 Install Dependencies

Install required packages:

```bash
npm install
```

Install Playwright browsers:

```bash
npx playwright install
```

---

## ▶️ Execute Tests

Run complete test suite:

```bash
npx playwright test
```

Run single test file:

```bash
npx playwright test tests/<file-name>.spec.js
```

Run tests in headed mode:

```bash
npx playwright test --headed
```

Run specific browser:

Chromium:

```bash
npx playwright test --project=chromium
```

Firefox:

```bash
npx playwright test --project=firefox
```

WebKit:

```bash
npx playwright test --project=webkit
```

---

## 📊 View Reports

Generate and open HTML report:

```bash
npx playwright show-report
```

---

## 🎯 Automated User Flow

Framework validates onboarding functionality including:

- User onboarding process
- Form validations
- Navigation verification
- UI element validation
- Assertions and expected behavior checks
- End-to-End workflow verification

## 🔧 Configuration

Update Playwright configuration from:

```bash
playwright.config.js
```

Configurations include:

- Base URL
- Browser setup
- Parallel execution
- Retry mechanism
- Timeout settings
- Reporter configuration

---

## 🛠 Troubleshooting

If dependencies fail:

Delete node_modules:

```bash
rm -rf node_modules
```

Reinstall:

```bash
npm install
```

Reinstall browsers:

```bash
npx playwright install
```

---

## 📌 Best Practices Followed

- Page Object Model (POM)
- Reusable utilities
- Maintainable folder structure
- Scalable automation design
- Separate test data management

---

## 👨‍💻 Author

Nihal Jaiswal

QA Engineer | Manual Testing | API Testing | Playwright Automation

GitHub:

https://github.com/Nihal1610

---

## 📄 License

This project is intended for learning, automation practice, and QA framework implementation.
