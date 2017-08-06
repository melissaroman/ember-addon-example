import { test } from 'ember-qunit';
import { moduleFor } from 'dummy/tests/helpers/test-module-for-engine';
import sinon from 'sinon';
import RSVP from 'rsvp';
import run from 'ember-runloop';

const {
  resolve, reject
} = RSVP;

function saveable(result) {
  const saveablePromise = resolve(result);
  saveablePromise.save = () => saveablePromise;
  return saveablePromise;
}

moduleFor('controller:new/modal/confirm', 'Unit | Controller | new/modal/confirm', {
  needs: [],
  beforeEach() {
    // Create a stub for the store's createRecord hook
    const createRecord = this.createStub = sinon.stub();
    createRecord.returns(saveable({}));

    const danger = this.danger = sinon.stub();
    this.register('service:flash-messages', { danger }, { instantiate: false });
    this.register('service:store', { createRecord }, { instantiate: false });
    this.register('service:i18n', { t() {} }, { instantiate: false });
    this.register('service:metrics', {
      trackEvent() {}
    }, { instantiate: false });
  }
});

test('it can create a transfer', async function(assert) {
  const controller = this.subject();
  const transitionStub = sinon.stub(controller, 'transitionToRoute');
  const method = sinon.stub();

  transitionStub.returns({ method });
  sinon.stub(controller, 'send');

  controller.set('model', {
    tickets: [{ id: '1' }, { id: '2' }],
    email: 'foo@bar.baz',
    message: 'test'
  });

  await run(controller.get('createTransfer'), 'perform');

  assert.deepEqual(this.createStub.getCall(0).args[1], {
    tickets: [{ id: '1' }, { id: '2' }],
    message: 'test',
    recipient: {
      email: 'foo@bar.baz'
    }
  });
});

test('it redirects to `/success` on successful transfer', async function(assert) {
  const controller = this.subject();
  const transitionStub = sinon.stub(controller, 'transitionToRoute');
  const method = sinon.stub();

  const loading = sinon.stub(controller, 'send');

  transitionStub.returns({ method });

  controller.set('model', {
    tickets: [], recipient: {}
  });

  await run(controller.get('createTransfer'), 'perform');

  assert.equal(loading.getCall(0).args[0], 'showLoading', 'the `showLoading` hook was triggered');
  assert.equal(transitionStub.getCall(0).args[0], 'new.modal.success', 'transitioned to success route');
  assert.ok(method.getCall(0).calledWith('replace'));
});

test('it redirects to `/error` on failed transfer', async function(assert) {
  const controller = this.subject();
  const transitionStub = sinon.stub(controller, 'transitionToRoute');
  const method = sinon.stub();
  const loading = sinon.stub(controller, 'send');

  transitionStub.returns({ method });

  // Create a rejecting promise.
  this.createStub.returns(saveable(reject({})));

  controller.set('model', {
    tickets: [], recipient: {}
  });

  await run(controller.get('createTransfer'), 'perform');

  assert.equal(loading.getCall(0).args[0], 'showLoading', 'the `showLoading` hook was triggered');
  assert.equal(transitionStub.getCall(0).args[0], 'new.modal.confirm', 'transitioned back to confirm route');
  assert.equal(this.danger.callCount, 1, 'triggered a flashMessage');
  assert.ok(method.getCall(0).calledWith('replace'));
});
