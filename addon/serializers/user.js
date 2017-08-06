import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  serialize(snapshot, options) {
    const json = this._super(snapshot, options);
    json.id = snapshot.id;
    return json;
  }
});
