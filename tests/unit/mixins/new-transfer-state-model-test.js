import EmberObject from 'ember-object';
import NewTransferStateModelMixin from 'ticket-transfer-addon/mixins/new-transfer-state-model';
import { module, test } from 'qunit';

module('Unit | Mixin | new transfer state model');

test('it exists', function(assert) {
  // This mixin is implicitly tested in acceptances tests and the `routes/new/confirm-test`
  const NewTransferStateModelObject = EmberObject.extend(NewTransferStateModelMixin);
  const subject = NewTransferStateModelObject.create();
  assert.ok(subject);
});
