// Smoke: 1 user for 30 s. Does the journey work at all, and are the
// scripts and thresholds sane? Run this on every change before any load.
import { thresholds } from './lib/config.js';
import { userJourney } from './lib/journey.js';

export const options = {
  vus: 1,
  duration: '30s',
  thresholds,
};

export default userJourney;
