import Route from 'ember-route';
import get, { getProperties } from 'ember-metal/get';
import set from 'ember-metal/set';
import service from 'ember-service/inject';
import RSVP from 'rsvp';
import AuthenticatedRouteMixin from '../mixins/authenticated-route';

const { hash } = RSVP;

export default Route.extend(AuthenticatedRouteMixin, {
  session: service(),
  store: service(),

  queryParams: {
    acceptanceToken: {}
  },

  model({ acceptanceToken, transferId }) {
    const transfer = get(this, 'store').queryRecord('ticket-transfer', {
      acceptanceToken,
      id: transferId,
      include: 'tickets'
    });

    return {
      transfer,
      acceptanceToken,
      tickets: transfer.then((transfer) => get(transfer, 'tickets')),
      event: transfer.then((transfer) => get(transfer, 'tickets.firstObject.event'))
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
    set(controller, 'model', hash(model));
  },

  actions: {
    acceptSucceeded() {
      this.replaceWith('accept.success');
    },
    acceptFailed() {
      this.replaceWith('accept.handle-error');
    }
  }
});
