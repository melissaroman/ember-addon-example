import { test } from 'ember-qunit';
import { moduleFor } from 'dummy/tests/helpers/test-module-for-engine';

moduleFor('route:new/modal/terms', 'Unit | Route | new/modal/terms', {
  needs: ['service:transfers'],
  beforeEach() {
    this.register('service:metrics', {}, { instantiate: false });
  }
});

test('it exists', function(assert) {
  const route = this.subject();
  assert.ok(route);
});
