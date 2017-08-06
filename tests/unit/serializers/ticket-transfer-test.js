import run from 'ember-runloop';
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('ticket-transfer', 'Unit | Serializer | ticket transfer', {
  needs: ['serializer:ticket-transfer', 'serializer:application', 'model:ticket-transfer', 'model:ticket', 'model:event']
});

// Replace this with your real tests.
test('it serializes related ticket IDs', function(assert) {
  const store = this.store();
  run(store, 'pushPayload', 'ticket', {
    ticket: {
      id: '1'
    }
  });

  const ticket = run(store, 'peekRecord', 'ticket', '1');
  const record = this.subject({
    tickets: [ticket]
  });

  const { ticketIds } = record.serialize();

  assert.deepEqual(ticketIds, ['1']);
});
