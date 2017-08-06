import run from 'ember-runloop';
import get from 'ember-metal/get';
import set from 'ember-metal/set';
import createTransfer from 'dummy/mirage/scenarios/create-transfer';
import { moduleForIntegration, test } from '../../helpers/module-for-integration';
import startMirage from '../../helpers/setup-mirage-for-integration';


moduleForIntegration('Integration | Model | ticket-transfer', {
  beforeEach() {
    this.store = this.container.lookup('service:store');
    startMirage(this.container);
  },

  afterEach() {
    server.shutdown();
  }
});

test('can accept all tickets for a transfer', async function(assert) {
  const { transfer: { id, acceptanceToken }, tickets } = createTransfer(server);

  let transfer = await run(this.store, 'queryRecord', 'ticket-transfer', { id, acceptanceToken });

  assert.equal(get(transfer, 'id'), id);
  assert.equal(get(transfer, 'tickets.length'), tickets.length, 'tickets were loaded into the store');

  run(null, set, transfer, 'status', 'ACCEPTED');

  await run(transfer, 'save');
  run(this.store, 'unloadAll');

  transfer = await run(this.store, 'queryRecord', 'ticket-transfer', { id, acceptanceToken });

  assert.equal(get(transfer, 'id'), id);
  assert.equal(get(transfer, 'status'), 'ACCEPTED', 'transfer state is updated');
  assert.equal(get(transfer, 'tickets.length'), tickets.length, 'tickets were loaded into the store');
});

test('can accept some tickets for a transfer', async function(assert) {
  const { transfer: { id, acceptanceToken }, tickets } = createTransfer(server);

  let transfer = await run(this.store, 'queryRecord', 'ticket-transfer', { id, acceptanceToken });

  assert.equal(get(transfer, 'id'), id);
  assert.equal(get(transfer, 'tickets.length'), tickets.length, 'tickets were loaded into the store');

  const lastTicket = get(transfer, 'tickets.lastObject');
  run(get(transfer, 'tickets'), 'removeObject', lastTicket);
  run(null, set, transfer, 'status', 'ACCEPTED');

  await run(transfer, 'save');
  run(this.store, 'unloadAll');

  transfer = await run(this.store, 'queryRecord', 'ticket-transfer', { id, acceptanceToken });

  assert.equal(get(transfer, 'id'), id);
  assert.equal(get(transfer, 'status'), 'ACCEPTED', 'transfer state is updated');
  assert.equal(get(transfer, 'tickets.length'), tickets.length - 1, 'tickets were loaded into the store');
});

test('can accept no tickets for a transfer', async function(assert) {
  const { transfer: { id, acceptanceToken }, tickets } = createTransfer(server);

  let transfer = await run(this.store, 'queryRecord', 'ticket-transfer', { id, acceptanceToken });

  assert.equal(get(transfer, 'id'), id);
  assert.equal(get(transfer, 'tickets.length'), tickets.length, 'tickets were loaded into the store');

  run(null, set, transfer, 'tickets', []);
  run(null, set, transfer, 'status', 'REJECTED');

  await run(transfer, 'save');
  run(this.store, 'unloadAll');

  transfer = await run(this.store, 'queryRecord', 'ticket-transfer', { id, acceptanceToken });

  assert.equal(get(transfer, 'id'), id);
  assert.equal(get(transfer, 'status'), 'REJECTED', 'transfer state is updated');
  assert.equal(get(transfer, 'tickets.length'), 0, 'tickets were loaded into the store');
});

test('the `acceptableStatus` is fetched', async function(assert) {
  const { transfer: { id, acceptanceToken } } = createTransfer(server, {
    transferTraits: ['notAcceptableStatus']
  });

  const transfer = await run(this.store, 'queryRecord', 'ticket-transfer', { id, acceptanceToken });

  assert.equal(get(transfer, 'id'), id);

  assert.deepEqual(get(transfer, 'acceptanceState'), {
    acceptable: false,
    description: 'Invalid / Scanned'
  });
});
