import { test } from 'ember-qunit';
import { moduleFor } from 'dummy/tests/helpers/test-module-for-engine';

moduleFor('adapter:ticket-transfer', 'Unit | Adapter | ticket transfer', {
  needs: [],
  beforeEach() {
    this.register('service:session', {}, { instantiate: false });
  }
});

test('`urlForQueryRecord` will use `urlForFindRecord` if id is passed in the query', function(assert) {
  const adapter = this.subject();
  const query = { id: '1', other: 'test' };

  const url = adapter.urlForQueryRecord(query, 'ticket-transfer');
  assert.equal(url, 'localhost:9000/v2/ticket-transfers/1');
  assert.deepEqual(query, { other: 'test'}, 'the id was stripped from the query object');
});

test('`urlForQueryRecord` works normally if no id is passed in the query', function(assert) {
  const adapter = this.subject();
  const query = { other: 'test' };

  const url = adapter.urlForQueryRecord(query, 'ticket-transfer');
  assert.equal(url, 'localhost:9000/v2/ticket-transfers');
  assert.deepEqual(query, { other: 'test'}, 'the query was untouched');
});
