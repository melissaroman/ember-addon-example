import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    cancelModal() {
      // TODO: Use replaceRoute when https://github.com/emberjs/ember.js/issues/15179 is resolved
      this.transitionToRoute('new.index').method('replace');
    }
  }
});
