import { test } from 'ember-qunit';
import { moduleFor } from 'dummy/tests/helpers/test-module-for-engine';

moduleFor('route:accept', 'Unit | Route | accept', {
  needs: [],
  beforeEach() {
    this.register('service:session', {}, { instantiate: false });
  }
});

// TODO: Test the model hook.
test('it exists', function(assert) {
  const route = this.subject();
  assert.ok(route);
});
