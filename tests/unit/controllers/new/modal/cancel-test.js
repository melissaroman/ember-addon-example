import run from 'ember-runloop';
import RSVP from 'rsvp';
import sinon from 'sinon';
import { test } from 'ember-qunit';
import { moduleFor } from 'dummy/tests/helpers/test-module-for-engine';

const { resolve, reject } = RSVP;

function transferStub(result) {
  const reload = sinon.stub().returns(resolve());
  const transfer = {
    cancel() {},
    save() {
      return resolve(result);
    },
    tickets: [{ reload }]
  };

  sinon.stub(transfer, 'cancel').returns(transfer);
  return {
    model: transfer,
    reloadStub: reload
  };
}

moduleFor('controller:new/modal/cancel', 'Unit | Controller | new/modal/cancel', {
  needs: [],
  beforeEach() {
    const danger = this.danger = sinon.stub();
    const success = this.success = sinon.stub();

    this.register('service:flash-messages', { danger, success }, { instantiate: false });
    this.register('service:i18n', { t() {} }, { instantiate: false });
    this.register('service:metrics', {
      trackEvent() {}
    }, { instantiate: false });
  }
});

test('it can cancel a ticket transfer', async function(assert) {
  const { model, reloadStub } = transferStub({});
  const controller = this.subject({ model });

  await run(controller.get('cancelTransfer'), 'perform');

  assert.equal(model.cancel.callCount, 1, 'the model\'s cancel hook was called');
  assert.equal(this.success.callCount, 1, 'the success message was sent');
  assert.equal(this.danger.callCount, 0, 'the danger message was not sent');
  assert.equal(reloadStub.callCount, 1, 'the ticket was reloaded');
});

test('it handles a cancellation error', async function(assert) {
  const { model, reloadStub } = transferStub(reject({}));
  const controller = this.subject({ model });

  await run(controller.get('cancelTransfer'), 'perform');

  assert.equal(model.cancel.callCount, 1, 'the model\'s cancel hook was called');
  assert.equal(this.success.callCount, 0, 'the success message was not sent');
  assert.equal(this.danger.callCount, 1, 'the danger message was sent');
  assert.equal(reloadStub.callCount, 0, 'the ticket was not reloaded on an error');
});

test('the `cancelTransfer` action will transition to "new" on successful cancel', async function(assert) {
  const promise = resolve();
  const perform = sinon.stub().returns(promise);
  const cancelTransfer = { perform };

  const controller = this.subject({ cancelTransfer });
  const transitionStub = sinon.stub(controller, 'transitionToRoute');
  const method = sinon.stub();

  transitionStub.returns({ method });

  controller.send('cancelTransfer');

  await promise.then(() => {
    assert.equal(transitionStub.getCall(0).args[0], 'new');
    assert.ok(method.getCall(0).calledWithExactly('replace'));
  });
});
