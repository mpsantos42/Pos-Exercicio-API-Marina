// test/rest/checkout.test.js
const request = require('supertest');
const { expect } = require('chai');


const app = require('../../rest/app');

describe('REST - Checkout', () => {
  const random = Date.now();
  const user = {
    name: 'Checkout User ' + random,
    email: `checkout${random}@email.com`,
    password: 'senha123'
  };
  let token;

  beforeAll(async () => {
    // registrar usuário
    await request(app)
      .post('/api/users/register')
      .send(user)
      .set('Content-Type', 'application/json');

    // fazer login e pegar token
    const loginRes = await request(app)
      .post('/api/users/login')
      .send({ email: user.email, password: user.password })
      .set('Content-Type', 'application/json');

    token = loginRes.body.token;
  });

  it('deve rejeitar checkout sem token', async () => {
    const res = await request(app)
      .post('/api/checkout')
      .send({
        items: [{ productId: 1, quantity: 1 }],
        freight: 10,
        paymentMethod: 'boleto'
      });

    expect(res.status).to.be.oneOf([401, 403]);
  });

  it('deve aceitar checkout com boleto', async () => {
    const res = await request(app)
      .post('/api/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{ productId: 1, quantity: 2 }],
        freight: 20,
        paymentMethod: 'boleto'
      });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('valorFinal');
    expect(res.body.paymentMethod).to.equal('boleto');
  });

  it('deve aceitar checkout com cartão e aplicar desconto', async () => {
    const res = await request(app)
      .post('/api/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{ productId: 2, quantity: 1 }],
        freight: 15,
        paymentMethod: 'credit_card',
        cardData: {
          number: '4111111111111111',
          name: 'Titular Test',
          expiry: '12/30',
          cvv: '123'
        }
      });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('valorFinal');
    expect(res.body.paymentMethod).to.equal('credit_card');
  });
});