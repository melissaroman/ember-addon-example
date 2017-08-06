import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({
  urlForQueryRecord(query, modelName) {
    const { me } = query;

    if (me) {
      delete query.me;
      return this.urlForFindRecord('me', modelName);
    } else {
      return this._super(...arguments);
    }
  }
});
