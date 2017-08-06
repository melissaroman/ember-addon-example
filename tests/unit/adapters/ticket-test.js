import { test } from 'ember-qunit';
import { moduleFor } from 'dummy/tests/helpers/test-module-for-engine';

moduleFor('adapter:ticket', 'Unit | Adapter | ticket', {
  needs: [],
  beforeEach() {
    this.register('service:session', {}, { instantiate: false });
  }
});

test('directs queries with a order id to `orders/:id/tickets`', function(assert) {
  const adapter = this.subject({
    host: '',
    namespace: ''
  });

  assert.equal(adapter.urlForQuery({}, 'ticket'), '/tickets', 'tickets route used if no orderId');

  const query = { orderId: '1234' };
  assert.equal(adapter.urlForQuery(query, 'ticket'), '/orders/1234/tickets', 'users route used if user Id present');
  assert.ok(!('orderId' in query), '`orderId` was removed from query object');
});

