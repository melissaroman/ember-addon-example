/*jshint node:true*/
'use strict';

const { configForDeployTarget } = require('ticketfly-ember-env');

module.exports = function(environment, appConfig) {
  return {
    environment: environment,
    modulePrefix: 'ticket-transfer-addon',
    i18n: {
      defaultLocale: 'en'
    },
    ticketflyAPI: {
      namespace: 'v2',
      host: configForDeployTarget({
        default: 'localhost:9000',
        local: 'http://localhost:9000',
        dev$(environment) {
          return `https://${environment}-api.ticketfly.com`;
        },
        stage$: 'https://consumer-api-service-stage02.tflystage.com',
        prod$: 'https://api.ticketfly.com'
      }),
    }
  };
};
