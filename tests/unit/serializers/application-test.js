import Model from 'ember-data/model';
import run from 'ember-runloop';
import { belongsTo, hasMany } from 'ember-data/relationships';
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('ticket', 'Unit | Serializer | application', {
  needs: ['serializer:application']
});

// Replace this with your real tests.
test('it uses ${key}Id for belongsTo relationships', function(assert) {
  this.container.registry.register('model:test-b', Model.extend());
  this.container.registry.register('model:test-a', Model.extend({
    child: belongsTo('test-b')
  }));

  const store = this.store();
  run(store, 'pushPayload', {
    testA: {
      id: '1',
      childId: '2'
    },
    testB: {
      id: '2'
    }
  });

  assert.equal(store.peekRecord('test-a', '1').get('child.id'), '2');
});

test('it uses ${key}Ids for hasMany relationships', function(assert) {
  this.container.registry.register('model:test-b', Model.extend());
  this.container.registry.register('model:test-a', Model.extend({
    children: hasMany('test-b')
  }));

  const store = this.store();
  run(store, 'pushPayload', {
    testA: {
      id: '1',
      childIds: ['2', '3']
    },
    testBs: [
      { id: '2'},
      { id: '3'}
    ]
  });

  assert.deepEqual(store.peekRecord('test-a', '1').get('children').mapBy('id'), ['2', '3']);
});
