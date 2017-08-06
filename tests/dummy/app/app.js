import Ember from 'ember';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';

Ember.MODEL_FACTORY_INJECTIONS = true;

const App = Ember.Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver,

  engines: {
    ticketTransferAddon: {
      dependencies: {
        externalRoutes: {
          done: 'index',
          login: 'test-login',
          'my-orders': 'index'
        },
        services: [
          'session',
          'store',
          'media',
          'metrics'
        ]
      }
    }
  }
});

loadInitializers(App, config.modulePrefix);

export default App;
