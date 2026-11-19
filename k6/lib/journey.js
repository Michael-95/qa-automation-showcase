import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { BASE_URL } from './config.js';

// QuickPizza's public demo token; override with QP_TOKEN if it changes.
const TOKEN = __ENV.QP_TOKEN || 'abcdef0123456789';

const recommendationRequest = JSON.stringify({
  maxCaloriesPerSlice: 1000,
  mustBeVegetarian: false,
  excludedIngredients: [],
  excludedTools: [],
  maxNumberOfToppings: 5,
  minNumberOfToppings: 2,
});

function hasPizzaName(res) {
  try {
    return Boolean(res.json('pizza.name'));
  } catch (e) {
    return false;
  }
}

/** One realistic visit: open the home page, then ask for a pizza. */
export function userJourney() {
  group('open home page', () => {
    const res = http.get(`${BASE_URL}/`, { tags: { name: 'home' } });
    check(res, { 'home: status 200': (r) => r.status === 200 });
  });

  sleep(Math.random() * 2 + 1); // think time, 1-3 s

  group('get a recommendation', () => {
    const res = http.post(`${BASE_URL}/api/pizza`, recommendationRequest, {
      headers: { 'Content-Type': 'application/json', Authorization: `token ${TOKEN}` },
      tags: { name: 'recommendation' },
    });
    check(res, {
      'recommendation: status 200': (r) => r.status === 200,
      'recommendation: returns a pizza': hasPizzaName,
    });
  });

  sleep(Math.random() * 2 + 1);
}
