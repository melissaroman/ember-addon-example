import run from 'ember-runloop';
import get from 'ember-metal/get';
import createOrder from 'dummy/mirage/scenarios/create-order';
import { moduleForIntegration, test } from '../../helpers/module-for-integration';
import startMirage from '../../helpers/setup-mirage-for-integration';

moduleForIntegration('Integration | Model | tickets', {
  beforeEach() {
    this.store = this.container.lookup('service:store');

    this.register('service:session', {
      authorize(authorizer, block) {
        block('Authorization', `Bearer 1234-3456-5678`);
      }
    }, { instantiate: false });

    startMirage(this.container);
  },

  afterEach() {
    server.shutdown();
  }
});

test('can create a ticket-transfer', async function(assert) {
  const { tickets: [{ orderId }] } = createOrder(server);

  const tickets = await this.store.query('ticket', { orderId });
  const transfer = run(this.store, 'createRecord', 'ticket-transfer', { tickets });

  const [ticketId] = transfer.hasMany('tickets').ids();
  assert.ok(ticketId, 'the transfer has some tickets');
  assert.ok(this.store.peekRecord('ticket', ticketId), 'the ticket has a transfer');

  await run(transfer, 'save');

  run(this.store, 'unloadAll');

  const refreshedTickets = await this.store.query('ticket', { orderId });

  assert.ok(get(refreshedTickets, 'firstObject').belongsTo('transfer').id(), 'ticket has a transfer still');
});

test('fetching tickets that already have transfers shows them', async function(assert) {
  const { tickets: [{ orderId }] } = createOrder(server, {
    ticketTraits: ['hasTransfer']
  });

  const tickets = await this.store.query('ticket', { orderId });
  const ticket = get(tickets, 'firstObject');

  assert.ok(get(ticket, 'transfer'), 'the ticket has a transfer');
  assert.ok(get(ticket, 'transfer.recipient.email'), 'the ticket has a recipient');
  assert.ok(get(ticket, 'transferState.description'), 'there is a description too');
});
