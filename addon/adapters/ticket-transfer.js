import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({
  urlForQueryRecord(query, modelName) {
    const { id } = query;

    if (id) {
      delete query.id;
      return this.urlForFindRecord(id, modelName);
    } else {
      return this._super(...arguments);
    }
  }
});
