// test/controllers/controllers.test.js
const sinon = require('sinon');
const { expect } = require('chai');


const usersController = require('../../rest/src/controllers/usersController'); 
const userModel = require('../../rest/src/models/users'); 

describe('Controller - Users (unit)', () => {
  afterEach(() => sinon.restore());

  it('register controller chama userModel.create e retorna user', async () => {
    const fakeReq = { body: { name: 'X', email: 'x@mail', password: 'p' } };
    const fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis()
    };

    // stub do model/create
    const createdUser = { id: 1, name: 'X', email: 'x@mail' };
    sinon.stub(userModel, 'create').resolves(createdUser);

    // chamar a função do controller (assumindo async function register(req, res))
    await usersController.register(fakeReq, fakeRes);

    expect(fakeRes.status.called).to.be.true;
    expect(fakeRes.json.calledWith(sinon.match.has('email', createdUser.email))).to.be.true;
  });
});