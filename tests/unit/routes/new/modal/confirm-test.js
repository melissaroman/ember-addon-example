import { test } from 'ember-qunit';
import { moduleFor } from 'dummy/tests/helpers/test-module-for-engine';
import sinon from 'sinon';

moduleFor('route:new/modal/confirm', 'Unit | Route | new/modal/confirm', {
  needs: [],
  beforeEach() {
    this.register('service:metrics', {}, { instantiate: false });
  }
});

test('it gets the model from the `transfers` service', function(assert) {
  const service = { getTransferState() {} };
  const serviceStub = sinon.stub(service, 'getTransferState');

  serviceStub.returns({
    tickets: [{}],
    email: 'foo@bar.baz'
  });

  this.register('service:transfers', service, { instantiate: false });

  const route = this.subject();

  assert.deepEqual(route.model(), {
    tickets: [{}],
    email: 'foo@bar.baz'
  });

  assert.equal(serviceStub.callCount, 1, '`getTransferState` was called once');
});

test('it redirects with empty tickets array', function(assert) {
  const service = { getTransferState() {} };
  const serviceStub = sinon.stub(service, 'getTransferState');

  serviceStub.returns({
    tickets: [],
    email: 'foo@bar.baz'
  });

  this.register('service:transfers', service, { instantiate: false });

  const route = this.subject();
  const transitionStub = sinon.stub(route, 'replaceWith');

  assert.ok(!route.model(), 'model returns falsey value');
  assert.equal(serviceStub.callCount, 1, '`getTransferState` was called once');
  assert.ok(transitionStub.getCall(0).calledWithExactly('new.index'), 'transition back to order transfer page');
});

test('it redirects with empty email', function(assert) {
  const service = { getTransferState() {} };
  const serviceStub = sinon.stub(service, 'getTransferState');

  serviceStub.returns({
    tickets: [{}],
    email: ''
  });

  this.register('service:transfers', service, { instantiate: false });

  const route = this.subject();
  const transitionStub = sinon.stub(route, 'replaceWith');

  assert.ok(!route.model(), 'model returns falsey value');
  assert.equal(serviceStub.callCount, 1, '`getTransferState` was called once');
  assert.ok(transitionStub.getCall(0).calledWithExactly('new.index'), 'transition back to order transfer page');
});
