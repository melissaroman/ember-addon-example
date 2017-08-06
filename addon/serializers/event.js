import Serializer from './application';

function makeVenueMap(venues) {
  return (venues || []).reduce((map, venue) => {
    map.set(venue.id, venue);
    return map;
  }, new Map());
}

function makeVenueMerger(venueMap) {
  return (event) => {
    const { venueId } = event;
    delete event.venueId;

    event.venue = venueId && venueMap.has(venueId) ? venueMap.get(venueId) : null;
    return event;
  };
}

export default Serializer.extend({
  normalizeSingleResponse(store, modelClass, payload, id, method) {
    const venueMap = makeVenueMap(payload.venues);

    // Strip out all other keys on the payload
    const event = makeVenueMerger(venueMap)(payload.event);
    return this._super(store, modelClass, { event }, id, method);
  },

  normalizeArrayResponse(store, modelClass, payload, id, method) {
    const venueMap = makeVenueMap(payload.venues);

    // Strip out all other keys on the payload
    const events = payload.events.map(makeVenueMerger(venueMap));
    return this._super(store, modelClass, { events }, id, method);
  }
});
