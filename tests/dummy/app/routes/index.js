import Route from 'ember-route';
import env from 'dummy/config/environment';
import service from 'ember-service/inject';
import get from 'ember-metal/get';

let IndexRoute = Route.extend();

if (env.environment !== 'test') {
  IndexRoute = Route.extend({
    session: service(),
    beforeModel() {
      const authData = this.generateAuthData();

      if (authData) {
        return get(this, 'session')
          .authenticate('authenticator:oauth2', authData)
          .finally(() => {
            this.transitionTo('dummy-login');
          });
      } else {
        this.transitionTo('dummy-login');
      }
    },

    generateAuthData() {
      const { hash } = window.location;
      const parts = hash.replace(/^#/, '').split('&').map((str) => str.split('='));

      if (parts.length > 0) {
        return parts.reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {});
      }
    }
  });
}

export default IndexRoute;
