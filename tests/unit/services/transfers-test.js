import { test } from 'ember-qunit';
import { moduleFor } from 'dummy/tests/helpers/test-module-for-engine';

moduleFor('service:transfers', 'Unit | Service | transfers', {});

test('it can get and set transfer state', function(assert) {
  const service = this.subject();

  service.setTransferState({ tickets: [], email: 'test', message: 'Hello!' });

  assert.deepEqual(service.getTransferState(), {
    tickets: [],
    email: 'test',
    message: 'Hello!'
  });
});
