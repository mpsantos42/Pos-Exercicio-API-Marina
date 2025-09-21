// test/rest/users.test.js
const request = require('supertest');
const { expect } = require('chai');


const app = require('../../rest/app'); 

describe('REST - Users', () => {
  const random = Date.now();
  const user = {
    name: 'Test User ' + random,
    email: `test${random}@email.com`,
    password: 'senha123'
  };

  it('POST /api/users/register - registra usuário e retorna 201/200', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send(user)
      .set('Content-Type', 'application/json');

    expect(res.status).to.be.oneOf([200, 201]);
    expect(res.body.user).to.have.property('email', user.email);
    expect(res.body.user).to.have.property('name', user.name);
  });

  it('POST /api/users/login - faz login e retorna token', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: user.email, password: user.password })
      .set('Content-Type', 'application/json');

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('token').that.is.a('string');
  });
});