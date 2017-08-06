import Route from 'ember-route';
import get from 'ember-metal/get';

export default Route.extend({
  model() {
    const { transfer } = this.modelFor('accept');
    return transfer;
  },

  afterModel(model) {
    if (get(model, 'isPending')) {
      this.replaceWith('accept.confirm');
    }
  }
});
