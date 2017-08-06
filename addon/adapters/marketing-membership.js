import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({
  urlForQuery(query) {
    const { userId } = query;
    delete query.userId;
    return this._urlForMembership(userId);
  },

  urlForCreateRecord() {
    return this._urlForSave();
  },

  urlForUpdateRecord(id) {
    const base = this._urlForSave();
    return `${base}/${id}`;
  },

  _urlForSave() {
    return this.buildURL('orgMemberships');
  },

  _urlForMembership(userId) {
    return this.buildURL(`users/${userId}/orgMemberships`);
  }
});
