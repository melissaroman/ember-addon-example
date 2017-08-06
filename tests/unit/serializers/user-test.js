import { moduleForModel, test } from 'ember-qunit';

moduleForModel('user', 'Unit | Serializer | user', {
  needs: ['serializer:application', 'serializer:user', 'service:metrics']
});

test('it serializes with all required attributes', function(assert) {
  const record = this.subject({
    id: '1',
    firstName: 'Spencer',
    lastName: 'Price',
    email: 'spencer.price@ticketfly.com'
  });


  assert.deepEqual(record.serialize(), {
    id: '1',
    firstName: 'Spencer',
    lastName: 'Price',
    email: 'spencer.price@ticketfly.com'
  });
});
