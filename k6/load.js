// Load: ramp to expected traffic, hold it, ramp down.
// Answers "does it meet the latency budget at a normal busy hour?"
import { thresholds, vus } from './lib/config.js';
import { userJourney } from './lib/journey.js';

export const options = {
  stages: [
    { duration: '1m', target: vus(0.5) }, // ramp up
    { duration: '3m', target: vus(0.5) }, // steady state
    { duration: '30s', target: 0 }, // ramp down
  ],
  thresholds,
};

export default userJourney;
