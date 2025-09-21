// test/graphql/graphql.test.js
const request = require('supertest');
const { expect } = require('chai');


const app = require('../../graphql/app'); 

describe('GraphQL API', () => {
  let token;
  const random = Date.now();
  const email = `gql${random}@mail.com`;
  const password = '123456';

  it('mutation register -> cria usuário', async () => {
    const query = `
      mutation Register($name: String!, $email: String!, $password: String!) {
        register(name: $name, email: $email, password: $password) {
          email
          name
        }
      }
    `;
    const res = await request(app)
      .post('/graphql')
      .send({
        query,
        variables: { name: 'GQL User', email, password }
      })
      .set('Content-Type', 'application/json');

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('data');
    expect(res.body.data.register).to.have.property('email', email);
  });

  it('mutation login -> retorna token', async () => {
    const query = `
      mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
          token
        }
      }
    `;
    const res = await request(app)
      .post('/graphql')
      .send({
        query,
        variables: { email, password }
      })
      .set('Content-Type', 'application/json');

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('data');
    expect(res.body.data.login).to.have.property('token').that.is.a('string');
    token = res.body.data.login.token;
  });

  it('mutation checkout (boleto) -> exige Authorization e retorna dados', async () => {
    const query = `
      mutation Checkout($items: [CheckoutItemInput!]!, $freight: Float!, $paymentMethod: String!) {
        checkout(items: $items, freight: $freight, paymentMethod: $paymentMethod) {
          freight
          items { productId quantity }
          paymentMethod
          valorFinal
        }
      }
    `;
    // sem token deve falhar
    const resNoAuth = await request(app)
      .post('/graphql')
      .send({
        query,
        variables: { items: [{ productId: 1, quantity: 1 }], freight: 10, paymentMethod: 'boleto' }
      })
      .set('Content-Type', 'application/json');

    // pode retornar errors ou status 200 com errors, por isso checamos ambos:
    if (resNoAuth.body && resNoAuth.body.errors) {
      expect(resNoAuth.body.errors.length).to.be.greaterThan(0);
    } else {
      expect(resNoAuth.status).to.be.oneOf([401, 403]);
    }

    // com token
    const res = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query,
        variables: { items: [{ productId: 1, quantity: 2 }], freight: 10, paymentMethod: 'boleto' }
      })
      .set('Content-Type', 'application/json');

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('data');
    expect(res.body.data.checkout).to.have.property('valorFinal');
  });
});