import { test } from 'ember-qunit';
import { moduleFor } from 'dummy/tests/helpers/test-module-for-engine';

moduleFor('adapter:marketing-membership', 'Unit | Adapter | marketing membership', {
  needs: [],
  beforeEach() {
    this.register('service:session', {}, { instantiate: false });
  }
});

test('urlForQuery', function(assert) {
  const adapter = this.subject();
  const url = adapter.urlForQuery({
    userId: '1234'
  });

  assert.equal(url, 'localhost:9000/v2/users/1234/orgMemberships');
});

test('urlForCreateRecord', function(assert) {
  const adapter = this.subject();
  const url = adapter.urlForCreateRecord('marketing-membership');

  assert.equal(url, 'localhost:9000/v2/orgMemberships');
});

test('urlForUpdateRecord', function(assert) {
  const adapter = this.subject();
  const url = adapter.urlForUpdateRecord('1', 'marketing-membership');

  assert.equal(url, 'localhost:9000/v2/orgMemberships/1');
});
