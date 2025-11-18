// backend/tests/auth.test.js
const request = require('supertest');
const app = require('../server');

describe('Auth endpoints (integration)', () => {
  test('register -> login -> me', async () => {
    const email = `test${Date.now()}@example.com`;
    const password = 'Password123!';

    const reg = await request(app).post('/api/auth/register').send({ name: 'Test', email, password });
    expect(reg.statusCode).toBe(201);
    expect(reg.body).toHaveProperty('token');

    const login = await request(app).post('/api/auth/login').send({ email, password });
    expect(login.statusCode).toBe(200);
    expect(login.body).toHaveProperty('token');

    const token = login.body.token;
    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(me.statusCode).toBe(200);
    expect(me.body.email).toBe(email);
  }, 20000);
});
