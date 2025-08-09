const request = require('supertest');

process.env.NODE_ENV = 'test';
process.env.SESSION_SECRET = 'testsecret';

const app = require('../server');

describe('GET /api/auth/session', () => {
  it('returns 401 when no session exists', async () => {
    await request(app).get('/api/auth/session').expect(401);
  });
});
