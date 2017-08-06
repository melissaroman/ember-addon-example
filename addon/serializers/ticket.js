import get from 'ember-metal/get';
import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  extractRelationships(modelClass, relationshipMeta) {
    // Extract the transferId from the transferState Hash
    relationshipMeta.transferId = get(relationshipMeta, 'transferState.transferId');
    return this._super(modelClass, relationshipMeta);
  },

  modelNameFromPayloadKey(key) {
    return key === 'transfers' ? 'ticket-transfer' : this._super(key);
  }
});
