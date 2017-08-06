import { moduleForModel, test } from 'ember-qunit';

moduleForModel('event', 'Unit | Model | event', {});

test('it should exist', function(assert) {
  const Event = this.store().modelFor('event');
  assert.ok(Event)
});
