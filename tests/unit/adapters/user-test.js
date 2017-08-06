import { test } from 'ember-qunit';
import { moduleFor } from 'dummy/tests/helpers/test-module-for-engine';

moduleFor('adapter:user', 'Unit | Adapter | user', {
  needs: [],
  beforeEach() {
    this.register('service:session', {}, { instantiate: false });
  }
});

// Replace this with your real tests.
test('it uses the `/users/me` on queryRecord', function(assert) {
  const adapter = this.subject();
  const query = { me: true };
  const url = adapter.urlForQueryRecord(query, 'user');
  assert.equal(url, 'localhost:9000/v2/users/me');
  assert.deepEqual(query, {}, 'me attribute stripped from query');
});
