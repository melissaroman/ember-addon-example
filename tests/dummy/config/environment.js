/* jshint node: true */
const configSegment = require('ticketfly-metrics').configSegment;

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'dummy',
    environment: environment,
    rootURL: '/',
    locationType: 'auto',
    ticketflyAPI: {
      host: 'localhost:9000',
      namespace: 'v2'
    },
    i18n: {
      defaultLocale: 'en'
    },
    EmberENV: {
      FEATURES: {},
      EXTEND_PROTOTYPES: {
        Date: false
      }
    },
    APP: {},
    metricsAdapters: configSegment(environment, {})
  };

  if (environment === 'development') {

  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {

  }

  ENV['ember-cli-mirage'] = {
    enabled: true,
    directory: 'addon/mirage'
  };

  return ENV;
};
