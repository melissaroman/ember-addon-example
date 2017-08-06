import { Factory, trait, faker } from 'ember-cli-mirage';

const {
  random: {
    arrayElement,
    number,
    uuid
  }
} = faker;

export default Factory.extend({
  ticketTransferTransferable: true,
  ticketTransferDescription: 'READY_TO_TRANSFER',
  orderId: uuid,

  propertiesVariantName() {
    return arrayElement([
      'General Admission',
      'Reserved',
      '21 & Over General Admission',
      'Standing Room Only'
    ]);
  },

  code() {
    return number({
      min: 11111111111111,
      max: 99999999999999
    }).toString();
  },

  // Not used in app, but a way to trigger an error for testing purposes.
  _shouldTriggerTransferError: false,
  _ticketTransferCancelFails: false,

  reservedSeating: trait({
    propertiesSection() {
      return number({ min: 100, max: 500 });
    },
    propertiesRow() {
      return arrayElement('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''));
    },
    propertiesSeat() {
      return number({ min: 1, max: 49 });
    }
  }),

  hasTransfer: trait({
    ticketTransferTransferable: false,
    ticketTransferDescription: 'TRANSFER_PENDING'
  }),

  generalAdmission: trait({
    propertiesVariantName: 'General Admission'
  }),

  errorsOnCancelTransfer: trait({
    _ticketTransferCancelFails: true
  }),

  errorsOnTransfer: trait({
    _shouldTriggerTransferError: true
  }),

  afterCreate(ticket, server) {
    const traits = [];

    if (ticket._ticketTransferCancelFails) {
      traits.push('errorsOnTransfer');
    }

    if (!ticket.ticketTransferTransferable) {
      server.create('ticket-transfer', { tickets: [ticket] }, ...traits);
    }
  }
});
