// Stress: step past expected traffic to find where latency or errors
// start to climb. Run against an environment you own with a higher
// MAX_VUS; the default ceiling keeps it polite on the public demo.
import { thresholds, vus } from './lib/config.js';
import { userJourney } from './lib/journey.js';

export const options = {
  stages: [
    { duration: '1m', target: vus(0.25) },
    { duration: '2m', target: vus(0.5) },
    { duration: '2m', target: vus(0.75) },
    { duration: '2m', target: vus(1) },
    { duration: '1m', target: 0 },
  ],
  thresholds,
};

export default userJourney;
