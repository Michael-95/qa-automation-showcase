// Spike: sudden jump from near-idle to peak and back.
// Answers "does it survive a burst (campaign launch, push notification)
// and recover once the burst is over?"
import { thresholds, vus } from './lib/config.js';
import { userJourney } from './lib/journey.js';

export const options = {
  stages: [
    { duration: '30s', target: 1 },
    { duration: '10s', target: vus(1) }, // spike
    { duration: '1m', target: vus(1) },
    { duration: '10s', target: 1 }, // drop
    { duration: '1m', target: 1 }, // recovery window
  ],
  thresholds,
};

export default userJourney;
