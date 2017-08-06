import Route from 'ember-route';
import RSVP from 'rsvp';
import service from 'ember-service/inject';
import get, { getProperties } from 'ember-metal/get';
import set from 'ember-metal/set';
import AuthenticatedRouteMixin from '../mixins/authenticated-route';

const {
  hash
} = RSVP;

export default Route.extend(AuthenticatedRouteMixin, {
  session: service(),
  store: service(),

  model({ orderId, eventId }) {
    const store = get(this, 'store');
    const userPromise = store.queryRecord('user', { me: true });

    return {
      user: userPromise,
      tickets: store.query('ticket', { orderId, eventId, include: 'transfers', transferredTickets: true }),
      event: store.find('event', eventId)
    };
  },

  metricsForModel(model) {
    return hash(model).then(({ event }) => {
      const {
        name: eventName,
        id: eventId,
        organizationId: orgId,
        organizationName: orgName
      } = getProperties(event, 'name', 'id', 'organizationId', 'organizationName');

      return { eventName, eventId, orgId, orgName };
    });
  },

  setupController(controller, model) {
    set(controller, 'model', model);
    controller.resetState();

    hash(model).then(({ tickets, user }) => {
      // Track that we've identified the currently logged in user.
      user.identifyUserForMetrics();

      // If there were no tickets found, treat this as an error.
      if (get(tickets, 'length') === 0) {
        throw new Error('No tickets found');
      }
    }).catch((err) => {
      this.send('error', err);
    });
  },

  actions: {
    error(err) {
      this.controller.routeDidError(err);
    },
    resetTransfer() {
      get(this, 'controller').resetState();
    }
  }
});
