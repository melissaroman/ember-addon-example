import Controller from 'ember-controller';

export default Controller.extend({
  actions: {
    returnToConfirm() {
      // TODO: Use replaceRoute when https://github.com/emberjs/ember.js/issues/15179 is resolved
      this.transitionToRoute('accept.confirm').method('replace');
    }
  }
});
