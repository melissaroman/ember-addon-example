import get from 'ember-metal/get';
import set from 'ember-metal/set';
import run from 'ember-runloop';
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('ticket-transfer', 'Unit | Model | ticket transfer', {
  needs: ['model:ticket', 'model:event']
});

test('mode defaults to RECIPIENT_ACCEPT', function(assert) {
  const model = this.subject();
  assert.equal(get(model, 'mode'), 'RECIPIENT_ACCEPT');
});

test('status defaults to PENDING', function(assert) {
  const model = this.subject();
  assert.equal(get(model, 'status'), 'PENDING');
});

test('should have many tickets', function(assert) {
  const TicketTransfer = this.store().modelFor('ticket-transfer');
  const relationship = get(TicketTransfer, 'relationshipsByName').get('tickets');

  assert.equal(relationship.key, 'tickets');
  assert.equal(relationship.kind, 'hasMany');
});

test('the `accept` hook sets the correct status', function(assert) {
  const ticket = run(this.store(), 'createRecord', 'ticket');
  const model = this.subject({
    tickets: [ticket]
  });

  assert.equal(get(model, 'status'), 'PENDING');

  let chain;

  run(() => { chain = model.accept('1234-4567'); });

  assert.equal(get(model, 'status'), 'COMPLETED');
  assert.equal(get(model, 'acceptanceToken'), '1234-4567')
  assert.equal(chain, model, 'the hook is chainable');
});

test('the `accept` hook sets the correct status if empty tickets', function(assert) {
  const model = this.subject({
    tickets: []
  });

  assert.equal(get(model, 'status'), 'PENDING');

  let chain;

  run(() => { chain = model.accept(); });

  assert.equal(get(model, 'status'), 'DENIED');
  assert.equal(chain, model, 'the hook is chainable');
});

test('the `accept` hook sets the correct status if empty tickets', function(assert) {
  const model = this.subject({
    tickets: []
  });

  assert.equal(get(model, 'status'), 'PENDING');

  let chain;

  run(() => { chain = model.accept(); });

  assert.equal(get(model, 'status'), 'DENIED');
  assert.equal(chain, model, 'the hook is chainable');
});

test('the `cancel` hook sets the correct status', function(assert) {
  const model = this.subject();

  assert.equal(get(model, 'status'), 'PENDING');

  let chain;

  run(() => { chain = model.cancel(); });

  assert.equal(get(model, 'status'), 'CANCELLED');
  assert.equal(chain, model, 'the hook is chainable');
});

test('the `isCancelable` property works', function(assert) {
  const model = this.subject();

  assert.ok(model.get('isCancelable'));

  run(null, set, model, 'status', 'COMPLETED');

  assert.ok(!model.get('isCancelable'));

  run(null, set, model, 'status', 'DENIED');

  assert.ok(!model.get('isCancelable'));

  run(null, set, model, 'status', 'CANCELLED');

  assert.ok(!model.get('isCancelable'));
});

test('the `isPending` property works', function(assert) {
  const model = this.subject();

  assert.ok(model.get('isPending'));

  run(null, set, model, 'status', 'COMPLETED');

  assert.ok(!model.get('isPending'));

  run(null, set, model, 'status', 'DENIED');

  assert.ok(!model.get('isPending'));

  run(null, set, model, 'status', 'CANCELLED');

  assert.ok(!model.get('isPending'));
});

test('the `isCancelled` property works', function(assert) {
  const model = this.subject();

  assert.ok(!model.get('isCancelled'));

  run(null, set, model, 'status', 'COMPLETED');

  assert.ok(!model.get('isCancelled'));

  run(null, set, model, 'status', 'DENIED');

  assert.ok(!model.get('isCancelled'));

  run(null, set, model, 'status', 'CANCELLED');

  assert.ok(model.get('isCancelled'));

  run(null, set, model, 'status', '');

  assert.ok(model.get('isCancelled'));
});

test('the `isAcceptable` property works', function(assert) {
  const model = this.subject();

  assert.ok(model.get('isAcceptable'));

  run(null, set, model, 'status', 'COMPLETED');

  assert.ok(!model.get('isAcceptable'));

  run(null, set, model, 'status', 'DENIED');

  assert.ok(!model.get('isAcceptable'));

  run(null, set, model, 'status', 'CANCELLED');

  assert.ok(!model.get('isAcceptable'));

  run(null, set, model, 'status', 'PENDING');

  assert.ok(model.get('isAcceptable'));

  run(null, set, model, 'acceptanceState', {
    acceptable: false
  });

  assert.ok(!model.get('isAcceptable'));
});

test('the `isTransferred` property works', function(assert) {
  const model = this.subject();

  assert.ok(!model.get('isTransferred'));

  run(null, set, model, 'status', 'COMPLETED');

  assert.ok(model.get('isTransferred'));

  run(null, set, model, 'status', 'DENIED');

  assert.ok(!model.get('isTransferred'));

  run(null, set, model, 'status', 'CANCELLED');

  assert.ok(!model.get('isTransferred'));
});
