import ApplicationSerializer from './application';
import { assign } from 'ember-platform';

export default ApplicationSerializer.extend({
  shouldSerializeHasMany(snapshot, key) {
    return key === 'tickets';
  },

  // The API expects the ID to be in the payload.
  serialize(snapshot, options) {
    const json = this._super(snapshot, options);
    json.id = snapshot.id;
    return json;
  },

  normalizeSaveResponse() {
    const response = this._super(...arguments);
    // TODO: Remove this as it's covering for the bug in COM-2141.
    delete response.data.relationships.tickets;
    return response;
  },

  serializeIntoHash(data, type, record, options) {
    assign(data, this.serialize(record, options));
  }
});
