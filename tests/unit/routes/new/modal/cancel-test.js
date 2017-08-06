import Object from 'ember-object';
import { test } from 'ember-qunit';
import { moduleFor } from 'dummy/tests/helpers/test-module-for-engine';
import sinon from 'sinon';

moduleFor('route:new/modal/cancel', 'Unit | Route | new/modal/cancel', {
  needs: ['service:i18n', 'service:flash-messages', 'model:ticket-transfer'],
  beforeEach() {
    this.register('service:metrics', {}, { instantiate: false });
  }
});

test('the route fetches the model from the local store cache', function(assert) {
  const peekRecord = sinon.stub();
  const store = { peekRecord };

  const route = this.subject({ store });

  const model = {};
  peekRecord.returns(model);

  const result = route.model({ transferId: '1234' });

  assert.equal(result, model);
  assert.ok(peekRecord.getCall(0).calledWithExactly('ticket-transfer', '1234'));
});

test('the route will send an error and transition away if there is no local store cache for the transfer', function(assert) {
  const danger = sinon.stub();
  const replaceWith = sinon.stub();
  const flashMessages = { danger };
  const i18n = { t() {} };

  const route = this.subject({ flashMessages, replaceWith, i18n });

  const model = route.model({ transferId: '1234' });

  route.setupController(Object.create(), model);

  assert.ok(replaceWith.getCall(0).calledWithExactly('new'));
  assert.equal(danger.callCount, 1, 'a flash message was sent');
});
