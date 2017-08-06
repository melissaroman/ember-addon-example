import get from 'ember-metal/get';
import run from 'ember-runloop';
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('marketing-membership', 'Unit | Serializer | marketing membership', {
  needs: ['serializer:marketing-membership']
});

test('it serializes records', function(assert) {
  const serializer = this.store().serializerFor('marketing-membership');
  const record = this.subject({
    id: '1',
    userId: '1234',
    orgId: '2345',
    emailSubscription: true
  });

  const resultHash = {};
  serializer.serializeIntoHash(resultHash, { modelName: 'marketing-membership' }, record._internalModel.createSnapshot(), {});

  assert.deepEqual(resultHash, {
    membership: {
      id: '1',
      userId: '1234',
      orgId: '2345',
      emailSubscription: true,
      userUuid: '1234'
    }
  });
});

test('it deserializes records', function(assert) {
  const store = this.store();
  const serializer = store.serializerFor('marketing-membership');

  const record = run(() => {
    store.pushPayload(serializer.normalizeQueryRecordResponse(store, 'marketing-membership', {
      memberships: [{
        id: '1',
        userId: '1234',
        orgId: '2345',
        emailSubscription: true
      }]
    }, null, 'queryRecord'));

    return store.peekRecord('marketing-membership', '1');
  });

  assert.equal(get(record, 'id'), '1');
});
