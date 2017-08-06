import { A } from 'ember-array/utils';
import scenarioDefaults from '../helpers/scenario-defaults';

export default scenarioDefaults({
  ticketsPerEvent: 1,
  ticketConfig: {},
  eventsPerOrder: 1,
  eventConfig: {},
  orderId: null,
  ticketTraits: ['reservedSeating'],
  reservedSeating: true,
  userConfig: {}
}, function(server, options) {
  const ticketConfig = options.get('ticketConfig');

  let user;
  if (ticketConfig.userId) {
    user = server.schema.users.find(ticketConfig.userId);
  } else {
    user = server.create('user', options.get('userConfig'));
  }

  const eventConfig = options.get('eventConfig');
  const events = server.createList('event', options.get('eventsPerOrder'), eventConfig);
  const tickets = A([]);

  events.forEach((event, index) => {
    const ticketAmount = options.get('ticketsPerEvent', index, event);
    const ticketConfig = options.get('ticketConfig', index, event);

    ticketConfig.event = event;
    ticketConfig.userId = user.id;

    const eventTickets = server.createList('ticket', ticketAmount, ...options.get('ticketTraits'), ticketConfig);
    tickets.pushObjects(eventTickets);
  });

  return { events, tickets, user };
});
