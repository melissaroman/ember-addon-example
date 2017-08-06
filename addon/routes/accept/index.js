import Route from 'ember-route';
import get from 'ember-metal/get';

export default Route.extend({
  afterModel({ transfer }) {
    // Only show confirm if this is a transfer we can accept.
    return transfer.then((resolvedTransfer) => {
      if (get(resolvedTransfer, 'isAcceptable')) {
        this.replaceWith('accept.confirm');
      }
    });
  }
});
