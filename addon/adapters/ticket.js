import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({
  urlForQuery(query, modelName) {
    let url = this._super(query, modelName);

    if ('orderId' in query) {
      const orderId = query.orderId;
      delete query.orderId;

      url = url.replace('tickets', `orders/${orderId}/tickets`);
    }

    return url;
  }
});
