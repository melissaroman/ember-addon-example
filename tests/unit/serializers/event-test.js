import { moduleForModel, test } from 'ember-qunit';

moduleForModel('event', 'Unit | Serializer | event', {
  needs: ['serializer:event', 'serializer:application']
});

test('it joins the venue information into an event with single response', function(assert) {
  const store = this.store();
  const serializer = store.serializerFor('event');

  const result = serializer.normalizeSingleResponse(store, store.modelFor('event'), {
    event: { id: '1', venueId: '2' },
    venues: [
      { id: '2' }
    ]
  }, '1', 'findRecord');

  assert.deepEqual(result, {
    data: {
      type: 'event',
      id: '1',
      attributes: {
        venue: { id: '2' }
      },
      relationships: {}
    },
    included: []
  });
});

test('it assigns `null` to venue if no corresponding venue was found', function(assert) {
  const store = this.store();
  const serializer = store.serializerFor('event');

  const result = serializer.normalizeSingleResponse(store, store.modelFor('event'), {
    event: { id: '1', venueId: '2' },
    venues: [
      { id: '3' }
    ]
  }, '1', 'findRecord');

  assert.deepEqual(result, {
    data: {
      type: 'event',
      id: '1',
      attributes: {
        venue: null
      },
      relationships: {}
    },
    included: []
  });
});

test('it assigns `null` to venue if it has not venue', function(assert) {
  const store = this.store();
  const serializer = store.serializerFor('event');

  const result = serializer.normalizeSingleResponse(store, store.modelFor('event'), {
    event: { id: '1' },
    venues: [
      { id: '3' }
    ]
  }, '1', 'findRecord');

  assert.deepEqual(result, {
    data: {
      type: 'event',
      id: '1',
      attributes: {
        venue: null
      },
      relationships: {}
    },
    included: []
  });
});

test('it joins the venue information into an event with array response', function(assert) {
  const store = this.store();
  const serializer = store.serializerFor('event');

  const result = serializer.normalizeArrayResponse(store, store.modelFor('event'), {
    events: [
      { id: '1', venueId: '2' },
      { id: '2', venueId: '2' },
      { id: '3', venueId: '3' }
    ],
    venues: [
      { id: '2' },
      { id: '3' }
    ]
  }, null, 'findAll');

  assert.deepEqual(result, {
    data: [
      {
        type: 'event',
        id: '1',
        attributes: { venue: { id: '2' } },
        relationships: {}
      },
      {
        type: 'event',
        id: '2',
        attributes: { venue: { id: '2' } },
        relationships: {}
      },
      {
        type: 'event',
        id: '3',
        attributes: { venue: { id: '3' } },
        relationships: {}
      }
    ],
    included: []
  });
});
