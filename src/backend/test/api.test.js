const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../index');

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test('POST /api/v1/auth/login with demo account returns demo user session', async () => {
  const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider: 'demo' })
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.code, 200);
  assert.equal(data.data.user.provider, 'demo');
  assert.equal(data.data.user.name, '展示使用者');
  assert.ok(data.data.token);
});

test('POST /api/v1/auth/login with oauth provider (google) returns oauth user', async () => {
  const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider: 'google', email: 'test@gmail.com', name: 'Google User' })
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.code, 200);
  assert.equal(data.data.user.provider, 'google');
  assert.ok(data.data.token);
});

test('GET /api/v1/auth/me returns current authenticated user', async () => {
  const res = await fetch(`${baseUrl}/api/v1/auth/me`, {
    headers: { 'Authorization': 'Bearer mock-demo-token' }
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.code, 200);
  assert.ok(data.data.user);
});

test('POST /api/v1/auth/logout succeeds', async () => {
  const res = await fetch(`${baseUrl}/api/v1/auth/logout`, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer mock-demo-token' }
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.code, 200);
});

test('GET /api/v1/profiles returns user profiles with reports', async () => {
  const res = await fetch(`${baseUrl}/api/v1/profiles`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.code, 200);
  assert.ok(Array.isArray(data.data));
  assert.ok(data.data.length >= 2); // Alex and Mom
  assert.ok(data.data[0].reports);
});

test('POST /api/v1/profiles creates a new profile for user', async () => {
  const res = await fetch(`${baseUrl}/api/v1/profiles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: '爸爸',
      gender: 'male',
      age: 68,
      relationship: '父親'
    })
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.code, 201);
  assert.equal(data.data.name, '爸爸');
  assert.ok(data.data.id);
});

test('PUT /api/v1/profiles/:id updates profile info', async () => {
  const res = await fetch(`${baseUrl}/api/v1/profiles/prof_alex`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      age: 34
    })
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.code, 200);
  assert.equal(data.data.age, 34);
});

test('GET /api/v1/profiles/:profileId/actions returns saved micro-actions from server DB', async () => {
  const res = await fetch(`${baseUrl}/api/v1/profiles/prof_alex/actions`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.code, 200);
  assert.ok(Array.isArray(data.data));
});

test('POST /api/v1/profiles/:profileId/actions saves micro-action to server DB', async () => {
  const newAction = {
    id: `act_${Date.now()}`,
    biomarkerKey: 'ALT',
    title: '減少飲酒頻率',
    categoryLabel: '生活',
    category: 'LIFESTYLE'
  };

  const res = await fetch(`${baseUrl}/api/v1/profiles/prof_alex/actions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newAction)
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.code, 201);
  assert.equal(data.data.title, '減少飲酒頻率');
});
