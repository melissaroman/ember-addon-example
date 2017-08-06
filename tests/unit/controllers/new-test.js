import get from 'ember-metal/get';
import set from 'ember-metal/set';
import { test } from 'ember-qunit';
import { moduleFor } from 'dummy/tests/helpers/test-module-for-engine';
import sinon from 'sinon';

moduleFor('controller:new', 'Unit | Controller | new', {
  needs: ['service:transfers', 'service:flashMessages', 'service:i18n']
});

// Replace this with your real tests.
test('it exists', function(assert) {
  const service = { setTransferState() {} };
  const serviceStub = sinon.stub(service, 'setTransferState');

  this.register('service:transfers', service, { instantiate: false });

  const controller = this.subject();
  const transitionStub = sinon.stub(controller, 'transitionToRoute');
  const method = sinon.stub();

  transitionStub.returns({ method });

  controller.send('submitTransfer');

  assert.ok(transitionStub.getCall(0).calledWithExactly('new.modal.confirm'), 'the correct transition was initiated');
  assert.ok(method.getCall(0).calledWithExactly('replace'));
  assert.ok(serviceStub.getCall(0).calledWithExactly({
    tickets: get(controller, 'selectedTickets'),
    email: get(controller, 'transferToEmail'),
    message: get(controller, 'transferMessage')
  }), '`setTransferState` was called on `transfers` service');
});

test('it can reset the default state', function(assert) {
  const controller = this.subject();

  assert.equal(get(controller, 'transferToEmail'), '');
  assert.equal(get(controller, 'transferMessage'), '');
  assert.deepEqual(get(controller, 'selectedTickets'), []);

  set(controller, 'transferToEmail', 'test@test.com');
  set(controller, 'transferMessage', 'Hello!');
  get(controller, 'selectedTickets').pushObject({});

  controller.resetState();

  assert.equal(get(controller, 'transferToEmail'), '');
  assert.equal(get(controller, 'transferMessage'), '');
  assert.deepEqual(get(controller, 'selectedTickets'), []);
});
