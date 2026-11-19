/**
 * Shared settings for every k6 scenario.
 *
 * Default target is QuickPizza, Grafana's public demo app for k6
 * (the successor to test.k6.io). It is meant for SMALL tests only, so
 * the load profiles below are deliberately gentle. Point PERF_BASE_URL at an
 * environment you own and raise MAX_VUS for real capacity testing.
 */
export const BASE_URL = __ENV.PERF_BASE_URL || 'https://quickpizza.grafana.com';

/** Hard ceiling on virtual users for any profile. */
export const MAX_VUS = Number(__ENV.MAX_VUS || 10);

/** Scale a profile's VU target to the ceiling. */
export const vus = (fractionOfMax) => Math.max(1, Math.round(MAX_VUS * fractionOfMax));

/** Pass/fail gates shared by all profiles; CI fails when any is breached. */
export const thresholds = {
  http_req_failed: ['rate<0.01'],
  'http_req_duration{name:home}': ['p(95)<800'],
  'http_req_duration{name:recommendation}': ['p(95)<1500'],
  checks: ['rate>0.99'],
};
