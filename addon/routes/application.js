import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    closeTransfers() {
      this.replaceWithExternal('done');
    },
  }
});
