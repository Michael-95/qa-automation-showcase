import { test, expect, type APIRequestContext } from '@playwright/test';

/**
 * Contract tests for the Restful-Booker practice API.
 * Each test creates its own data, so tests run in parallel and the
 * API's 10-minute reset never leaves a test depending on stale records.
 */

type Booking = {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: { checkin: string; checkout: string };
  additionalneeds?: string;
};

const ADMIN = {
  username: process.env.BOOKER_USER ?? 'admin',
  password: process.env.BOOKER_PASSWORD ?? 'password123',
};

function newBooking(overrides: Partial<Booking> = {}): Booking {
  const id = Math.random().toString(36).slice(2, 8);
  return {
    firstname: `Qa${id}`,
    lastname: 'Showcase',
    totalprice: 240,
    depositpaid: true,
    bookingdates: { checkin: '2027-03-01', checkout: '2027-03-05' },
    additionalneeds: 'Breakfast',
    ...overrides,
  };
}

/** Lightweight schema check: right keys, right types, ISO dates. */
function expectBookingShape(body: unknown) {
  const b = body as Booking;
  expect(typeof b.firstname).toBe('string');
  expect(typeof b.lastname).toBe('string');
  expect(typeof b.totalprice).toBe('number');
  expect(typeof b.depositpaid).toBe('boolean');
  expect(b.bookingdates.checkin).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expect(b.bookingdates.checkout).toMatch(/^\d{4}-\d{2}-\d{2}$/);
}

async function token(request: APIRequestContext): Promise<string> {
  const res = await request.post('/auth', { data: ADMIN });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.token, 'auth token').toBeTruthy();
  return body.token;
}

async function create(request: APIRequestContext, booking = newBooking()) {
  const res = await request.post('/booking', { data: booking });
  expect(res.status()).toBe(200);
  const body = await res.json();
  return { id: body.bookingid as number, body, booking };
}

test.describe('Health and auth', () => {
  test('health check responds @smoke', async ({ request }) => {
    const res = await request.get('/ping');
    expect(res.status()).toBe(201);
  });

  test('issues a token for valid credentials', async ({ request }) => {
    expect(await token(request)).toMatch(/^\w+$/);
  });

  test('refuses a token for bad credentials', async ({ request }) => {
    const res = await request.post('/auth', { data: { username: 'admin', password: 'wrong' } });
    const body = await res.json();
    expect(body.token).toBeUndefined();
    expect(body.reason).toBe('Bad credentials');
  });
});

test.describe('Booking lifecycle', () => {
  test('creates a booking and echoes the payload @smoke', async ({ request }) => {
    const { id, body, booking } = await create(request);

    expect(id).toEqual(expect.any(Number));
    expectBookingShape(body.booking);
    expect(body.booking).toMatchObject(booking);
  });

  test('reads a booking back by id', async ({ request }) => {
    const { id, booking } = await create(request);

    const res = await request.get(`/booking/${id}`);
    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject(booking);
  });

  test('finds a booking by name filter', async ({ request }) => {
    const { id, booking } = await create(request);

    const res = await request.get('/booking', { params: { firstname: booking.firstname, lastname: booking.lastname } });
    expect(res.status()).toBe(200);
    const ids = (await res.json()).map((b: { bookingid: number }) => b.bookingid);
    expect(ids).toContain(id);
  });

  test('replaces a booking with a valid token', async ({ request }) => {
    const { id } = await create(request);
    const updated = newBooking({ totalprice: 999, depositpaid: false });

    const res = await request.put(`/booking/${id}`, {
      data: updated,
      headers: { Cookie: `token=${await token(request)}` },
    });
    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject(updated);
  });

  test('partially updates a booking', async ({ request }) => {
    const { id, booking } = await create(request);

    const res = await request.patch(`/booking/${id}`, {
      data: { additionalneeds: 'Late checkout' },
      headers: { Cookie: `token=${await token(request)}` },
    });
    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject({ ...booking, additionalneeds: 'Late checkout' });
  });

  test('rejects an update without a token', async ({ request }) => {
    const { id } = await create(request);

    const res = await request.put(`/booking/${id}`, { data: newBooking() });
    expect(res.status()).toBe(403);
  });

  test('deletes a booking, which then returns 404', async ({ request }) => {
    const { id } = await create(request);

    const del = await request.delete(`/booking/${id}`, { headers: { Cookie: `token=${await token(request)}` } });
    expect(del.status()).toBe(201);

    const get = await request.get(`/booking/${id}`);
    expect(get.status()).toBe(404);
  });
});
