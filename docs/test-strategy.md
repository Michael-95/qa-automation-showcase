# Test strategy

How this suite decides what to test, where, and what "done" means. The same approach I use on client projects, applied here to public practice apps.

## Goals

1. **Catch regressions in the flows that make money first:** login, cart, checkout.
2. **Fail fast and point at the cause:** each layer runs as its own CI job, so a red job names the layer that broke.
3. **Stay trustworthy:** a flaky test is a bug. It gets fixed or quarantined, not retried forever.

## Risk-based coverage

| Area | Risk if broken | Layer | Depth |
|---|---|---|---|
| Login and access control | Nobody can buy; data exposed | UI (anonymous) | Happy path + every rejection rule + protected-page redirects |
| Checkout and totals | Lost orders, wrong charges | UI (3 browsers/devices) | Full order + price arithmetic + required-field validation |
| Product list, sorting, cart | Poor conversion | UI (3 browsers/devices) | Catalogue, all 4 sort orders, cart count and persistence |
| Accessibility | Excludes users; legal exposure | axe-core scan | WCAG 2.1 A/AA on key pages |
| Booking API | Data integrity, auth bypass | API contract | Full CRUD lifecycle, auth required on writes, response shape |
| Performance | Slow pages lose users; outages under load | k6 | Smoke, load, stress and spike profiles with p95 latency gates |

## Test layers

- **API tests** are fast and stable, so they carry the detailed data and rule checks.
- **UI tests** cover real user journeys end to end, but only the journeys that matter, not every permutation.
- **Accessibility** is scanned automatically. A scan catches roughly a third of WCAG issues, so it supplements a manual audit rather than replacing one.
- **Performance** starts with a 1-user smoke run on every change. Load, stress and spike profiles run on demand against an environment sized for it.

## Design choices

- **Page Object Model + fixtures:** specs read as user intent; selectors live in one place.
- **Stable selectors:** `data-test` attributes only, never CSS classes or text that copy edits change.
- **Log in once:** a setup project saves the session; tests start authenticated with an empty cart, so they stay independent and parallel.
- **Self-contained data:** API tests create their own bookings, so no test depends on another or on records that might have been reset.
- **Table-driven negatives:** each validation rule is one row; adding a rule is one line.
- **Evidence on failure:** trace on retry, screenshot and video on failure, HTML and JUnit reports uploaded as CI artifacts.

## Entry and exit criteria

- **Pull request:** typecheck plus all Playwright projects green.
- **Nightly:** full suite against the live apps, to catch drift in the systems under test.
- **Performance:** weekly smoke; threshold breach (error rate ≥ 1 %, p95 over budget, checks < 99 %) fails the job.

## Flake policy

1. CI retries a failed test up to twice and records a trace on the retry.
2. A test that passes only on retry is logged as flaky and investigated that week.
3. If it can't be fixed quickly, it is tagged and quarantined with a linked issue, never deleted silently.

## Out of scope here

- Payment provider integration (the demo has none).
- Visual regression baselines: easy to add, but noisy against a third-party site I don't control.
- Real capacity numbers: the public demo apps are not sized for load, so profiles are capped by `MAX_VUS`. On a real project, stress tests run against a dedicated staging environment.
