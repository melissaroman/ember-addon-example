import { Factory, trait, faker } from 'ember-cli-mirage';

const {
  name: {
    firstName,
    lastName
  },
  phone: {
    phoneNumber
  },
  internet: {
    email
  },
  random: {
    uuid
  }
} = faker;

export default Factory.extend({
  status: 'PENDING',
  acceptanceToken: uuid,
  _shouldTriggerAcceptError: false,

  acceptedStatus: trait({
    status: 'COMPLETED'
  }),

  errorsOnTransfer: trait({
    _shouldTriggerAcceptError: true
  }),

  cancelledStatus: trait({
    status: 'CANCELLED'
  }),

  deniedStatus: trait({
    status: 'DENIED'
  }),

  recipientFirstName: firstName,
  recipientLastName: lastName,
  recipientEmail: email,
  recipientPhone: phoneNumber,

  senderUserId: uuid,
  senderFirstName: firstName,
  senderLastName: lastName,
  senderEmail: email,
  senderPhone: phoneNumber,

  acceptanceStateAcceptable: true,
  acceptanceStateDescription: '',

  notAcceptableStatus: trait({
    acceptanceStateAcceptable: false,
    acceptanceStateDescription: 'Invalid / Scanned'
  })
});
