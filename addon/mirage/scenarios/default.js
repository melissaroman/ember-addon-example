import createOrder from './create-order';
import createTransfer from './create-transfer';

export default function(server) {
  const { id: userId, email } = server.create('user', {
    _authToken: '1234',
    email: 'transfertome@ticketfly.com'
  });

  server.create('user', {
    _authToken: '9999',
    firstName: '',
    lastName: ''
  });

  // ID = 1: Create a basic order.
  createOrder(server, {
    ticketsPerEvent: 5,
    eventsPerOrder: 1,
    ticketConfig: {
      userId,
      orderId: '1'
    }
  });

  // ID = 2: Create an order with some already-transferred tickets.
  createOrder(server, {
    ticketsPerEvent: 5,
    eventsPerOrder: 1,
    ticketTraits: ['hasTransfer'],
    ticketConfig: {
      userId,
      orderId: '2'
    }
  });

  // ID = 3: Create an order with a transfer that will fail
  createOrder(server, {
    ticketsPerEvent: 5,
    eventsPerOrder: 1,
    ticketTraits: ['errorsOnTransfer'],
    ticketConfig: {
      userId,
      orderId: '3'
    }
  });

  // ID = 4: Create an order with a transfer that will fail
  createOrder(server, {
    ticketsPerEvent: 0,
    eventsPerOrder: 1,
    ticketConfig: {
      userId,
      orderId: '4'
    }
  });

  // ID = 6:
  createTransfer(server, {
    eventsPerTransfer: 1,
    ticketsPerEvent: 2,
    transferConfig: {
      acceptanceToken: '1234'
    }
  });

  // ID = 7:
  createTransfer(server, {
    eventsPerTransfer: 1,
    ticketsPerEvent: 2,
    transferTraits: ['errorsOnTransfer'],
    transferConfig: {
      acceptanceToken: '1234'
    }
  });

  // ID = 8:
  createTransfer(server, {
    eventsPerTransfer: 1,
    ticketsPerEvent: 2,
    transferTraits: ['cancelledStatus'],
    transferConfig: {
      acceptanceToken: '1234'
    }
  });

  // ID = 9:
  createTransfer(server, {
    eventsPerTransfer: 1,
    ticketsPerEvent: 2,
    transferTraits: ['notAcceptableStatus'],
    transferConfig: {
      acceptanceToken: '1234'
    }
  });

  // ID = 10
  createTransfer(server, {
    eventsPerTransfer: 1,
    ticketsPerEvent: 2,
    transferConfig: {
      senderEmail: email,
      acceptanceToken: '1234'
    }
  });
}
