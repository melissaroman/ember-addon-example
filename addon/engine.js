import Engine from 'ember-engines/engine';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';

const { modulePrefix } = config;

const Eng = Engine.extend({
  modulePrefix,
  Resolver,

  dependencies: {
    services: [
      'session',
      'store',
      'media',
      'metrics'
    ],
    externalRoutes: [
      'done',
      'login',
      'my-orders'
    ]
  },

  init() {
    this.set('rootElement', 'body');
    return this._super(...arguments);
  }
});

loadInitializers(Eng, modulePrefix);

export default Eng;
