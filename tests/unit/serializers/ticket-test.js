import run from 'ember-runloop';
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('ticket', 'Unit | Serializer | ticket', {
  needs: ['serializer:ticket', 'model:ticket', 'model:ticket-transfer', 'model:event']
});

// Replace this with your real tests.
test('it gets the ticket-transfer relationship from transferState', function(assert) {
  const store = this.store();
  run(store, 'pushPayload', 'ticket', {
    ticket: {
      id: '1',
      transferState: {
        transferId: '1'
      }
    }
  });

  assert.ok(store.peekRecord('ticket', '1').belongsTo('transfer').id(), '1');
});
