import { moduleForModel, test } from 'ember-qunit';
import get from 'ember-metal/get';
import sinon from 'sinon';

moduleForModel('user', 'Unit | Model | user', {
  needs: ['service:metrics']
});

test('it exists and has an ID', function(assert) {
  const model = this.subject({ id: 1234 });
  assert.equal(model.get('id'), '1234');
});

test('it will identify a user with metrics service', function(assert) {
  const model = this.subject({
    id: '1234',
    firstName: 'Spencer',
    lastName: 'Price'
  });

  const metrics = get(model, 'metrics');
  const aliasStub = sinon.stub(metrics, 'alias');
  const identifyStub = sinon.stub(metrics, 'identify');

  model.identifyUserForMetrics();

  assert.equal(aliasStub.callCount, 1);
  assert.ok(aliasStub.getCall(0).calledWithExactly({
    alias: '1234'
  }));

  assert.equal(identifyStub.callCount, 1);
  assert.ok(identifyStub.getCall(0).calledWithExactly({
    distinctId: '1234',
    firstName: 'Spencer',
    lastName: 'Price'
  }));
});
