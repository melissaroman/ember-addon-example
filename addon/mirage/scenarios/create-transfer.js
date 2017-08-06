import { A } from 'ember-array/utils';
import scenarioDefaults from '../helpers/scenario-defaults';
import { assign } from 'ember-platform';

export default scenarioDefaults({
  transferConfig: {},
  eventsPerTransfer: 1,
  eventConfig: {},
  transferTraits: [],
  ticketsPerEvent: 4,
  ticketConfig: {},
  ticketTraits: [],
  createMarketingPreference: false,
  marketingPreferenceConfig: {}
}, function(server, options) {
  const transfer = server.create('ticket-transfer', ...options.get('transferTraits'), options.get('transferConfig'));

  const events = server.createList(
    'event',
    options.get('eventsPerTransfer'),
    options.get('eventConfig')
  );

  const tickets = A([]);
  const marketingMemberships = A([]);

  events.forEach((event, index) => {
    const ticketAmount = options.get('ticketsPerEvent', index, event);
    const ticketConfig = options.get('ticketConfig', index, event);

    ticketConfig.event = event;
    ticketConfig.ticketTransfer = transfer;

    const ticketArgs = ['ticket', ticketAmount];

    if (options.get('reservedSeating')) {
      ticketArgs.push('reservedSeating');
    }
    
    if (options.get('createMarketingPreference')) {
      const marketingConfig = assign({
        orgId: event.organizationId
      }, options.get('marketingPreferenceConfig'));
      
      marketingMemberships.push(server.create('marketing-membership', marketingConfig));
    }

    const eventTickets = server.createList(...ticketArgs, ...options.get('ticketTraits'), ticketConfig);
    tickets.pushObjects(eventTickets);
  });

  return { transfer, tickets, events, marketingMemberships };
});
