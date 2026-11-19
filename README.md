# QA Automation Showcase

[![Playwright](https://github.com/Michael-95/qa-automation-showcase/actions/workflows/playwright.yml/badge.svg)](https://github.com/Michael-95/qa-automation-showcase/actions/workflows/playwright.yml)
[![k6 performance](https://github.com/Michael-95/qa-automation-showcase/actions/workflows/k6.yml/badge.svg)](https://github.com/Michael-95/qa-automation-showcase/actions/workflows/k6.yml)

End-to-end, API, accessibility and performance test automation in one repo, running in GitHub Actions.

It uses the same structure and practices I use on production client projects, pointed at public practice apps so the code can be shared:

| Layer | Tool | Target |
|---|---|---|
| UI end-to-end | Playwright + TypeScript | [Sauce Demo](https://www.saucedemo.com) web shop |
| Accessibility | axe-core | Sauce Demo, WCAG 2.1 A/AA |
| API contract | Playwright request API | [Restful-Booker](https://restful-booker.herokuapp.com) |
| Performance | k6 | [QuickPizza](https://quickpizza.grafana.com), Grafana's k6 demo app |

## What it demonstrates

- **Page Object Model with fixtures:** specs read as user intent; selectors live in one place.
- **Log in once, test many:** a setup project saves the session; tests start authenticated with an empty cart and run in parallel.
- **Cross-browser and mobile:** the same journeys run on Chrome, Firefox and a Pixel 7 viewport.
- **Business-rule assertions:** checkout verifies the price arithmetic (lines → item total → tax → total), not just that a page loaded.
- **Table-driven negative testing:** login, access-control and form-validation rules, one row per rule.
- **API contract testing:** full booking lifecycle (create, read, filter, replace, patch, delete) and an auth check on writes, with each test creating its own data.
- **Accessibility scans:** full axe reports attached to every run, with an opt-in strict gate.
- **Performance profiles:** smoke, load, stress and spike scenarios with p95 latency and error-rate thresholds that fail the build.
- **CI built for diagnosis:** one job per test layer, nightly runs to catch drift, traces/screenshots/videos and HTML + JUnit reports kept as artifacts.

The reasoning behind what is covered, and what isn't, is in **[docs/test-strategy.md](docs/test-strategy.md)**.

## Project structure

```
├── playwright.config.ts      # projects: setup, anonymous, chromium, firefox, mobile, a11y, api
├── tests/
│   ├── setup/                # one-time login, saves session
│   ├── pages/                # page objects
│   ├── e2e/                  # login, product list, checkout
│   ├── a11y/                 # axe-core WCAG scans
│   ├── api/                  # Restful-Booker contract tests
│   ├── data/                 # users, products
│   └── support/              # fixtures, helpers
├── k6/
│   ├── lib/                  # shared config, thresholds, user journey
│   └── smoke.js · load.js · stress.js · spike.js
├── docs/test-strategy.md
└── .github/workflows/        # playwright.yml, k6.yml
```

## Run it locally

Requires Node 20+.

```bash
npm install
npx playwright install --with-deps

npm test                    # everything
npm run test:smoke          # @smoke-tagged tests only
npm run test:e2e            # login + shopping flows in Chrome
npm run test:cross-browser  # Firefox + mobile
npm run test:api            # API contract tests
npm run test:a11y           # accessibility scans (A11Y_STRICT=1 to gate)
npm run report              # open the HTML report
```

Performance tests need [k6](https://grafana.com/docs/k6/latest/set-up/install-k6/):

```bash
npm run k6:smoke            # 1 user, 30 s
npm run k6:load             # ramp, hold, ramp down
MAX_VUS=50 PERF_BASE_URL=https://your-staging-env npm run k6:stress
```

All settings are optional environment variables; see [.env.example](.env.example).

## A note on load

QuickPizza and Restful-Booker are shared public services. The load profiles are capped at 10 virtual users by default so this repo stays a good citizen. Real stress testing belongs on an environment you own; raise `MAX_VUS` only there.

## About me

I'm a Project Manager and Scrum Master with a QA engineering background, delivering for remote teams across the USA, Saudi Arabia and Europe. I build test automation like this for production projects, where the code itself stays private.

[LinkedIn](https://www.linkedin.com/in/nacereddine-badri) · [GitHub](https://github.com/Michael-95)
