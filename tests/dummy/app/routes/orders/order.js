import Order from 'ticket-transfer-addon/routes/orders/order';
import env from 'dummy/config/environment';
import get from 'ember-metal/get';

let OrderRoute = Order;

if (env.environment !== 'test') {
  OrderRoute = Order.extend({
    beforeModel() {
      if (!get(this, 'session.sessionIsValid')) {
        this.transitionTo('dummy-login');
      }
    }
  });
}

export default OrderRoute;
