import get from 'ember-metal/get';
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('ticket', 'Unit | Model | ticket', {
  needs: ['model:event', 'model:ticket-transfer']
});

test('transferState is passed as an unmodified POJO', function(assert) {
  const transferState = {};
  const model = this.subject({ transferState });

  assert.equal(model.get('transferState'), transferState);
});

test('should belong to an event', function(assert) {
  const Ticket = this.store().modelFor('ticket');
  const relationship = get(Ticket, 'relationshipsByName').get('event');

  assert.equal(relationship.key, 'event');
  assert.equal(relationship.kind, 'belongsTo');
});

test('should belong to a ticket-transfer', function(assert) {
  const Ticket = this.store().modelFor('ticket');
  const relationship = get(Ticket, 'relationshipsByName').get('transfer');

  assert.equal(relationship.key, 'transfer');
  assert.equal(relationship.kind, 'belongsTo');
});
