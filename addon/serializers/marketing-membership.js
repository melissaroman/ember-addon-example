import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  payloadKeyFromModelName(modelName) {
    if (modelName === 'marketing-membership') {
      return 'membership';
    } else {
      return this._super(...arguments);
    }
  },

  modelNameFromPayloadKey(key) {
    if (key === 'memberships' || key === 'membership') {
      return 'marketing-membership';
    } else {
      return this._super(...arguments);
    }
  },

  serialize(snapshot, options) {
    const json = this._super(snapshot, options);
    json.id = snapshot.id;
    json.userUuid = json.userId;
    return json;
  }
});
