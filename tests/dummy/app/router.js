import EmberRouter from 'ticketfly-metrics/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.mount('ticket-transfer-addon', { as: 'transfers' });
  this.route('dummy-login');

  // This "test-login" route does nothing; acts as a placeholder for tests
  this.route('test-login');

  this.route('animation-test', function() {
    this.route('step-1');
    this.route('step-2');
    this.route('step-3');
  });
});

export default Router;
