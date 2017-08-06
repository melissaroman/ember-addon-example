import Mixin from 'ember-metal/mixin';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Mixin.create(AuthenticatedRouteMixin, {
  transitionTo(routeName) {
    // Make sure that Ember Simple Auth visits external login page.
    if (routeName === 'login') {
      return this.replaceWithExternal(...arguments);
    } else {
      return this._super(...arguments);
    }
  }
})
