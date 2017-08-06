import { Response } from 'ember-cli-mirage'
import authRoute from './helpers/auth-route';

export default function(namespace = 'localhost:9000/v2') {
  this.timing = 200;
  this.namespace = namespace;

  this.get('/users/me', authRoute(({ users: userDb, db: { users } }, { params: { authToken } }) => {
    const [user] = users.where({ _authToken: authToken });

    if (!user) {
      return new Response(403, {}, {
        errors: 'No matching valid user.'
      });
    }

    return userDb.find(user.id);
  }));

  this.post('/users');

  this.put('/users/:id');

  this.get('/orders/:orderId/tickets', authRoute(({ tickets }, { params: { orderId } }) => {
    return tickets.where({ orderId });
  }));

  this.get('/tickets/:id', authRoute(({ tickets }, { params: { id } }) => {
    return tickets.find(id);
  }));

  this.get('/ticket-transfers/:id', function({ ticketTransfers }, req) {
    const { params: { id }, queryParams: { acceptanceToken } } = req;
    const transfer = ticketTransfers.find(id);

    // Make sure the acceptanceToken query param is sent along.
    if (!(acceptanceToken && acceptanceToken === transfer.acceptanceToken)) {
      return new Response(403, {}, {
        errors: 'Where is your acceptance token?'
      });
    }

    return transfer;
  });

  this.put('/ticket-transfers/:id', function({ ticketTransfers, tickets }, req) {
    // Move the content down a level
    const ticketTransfer = JSON.parse(req.requestBody);
    const { id } = ticketTransfer;

    req.requestBody = JSON.stringify({ ticketTransfer });

    if (id !== req.params.id) {
      return new Response(500, {}, {
        errors: 'You must include the `id` in the PUT payload'
      });
    }

    const attrs = this._getAttrsForRequest(this.request, 'ticket-transfer');
    const transfer = ticketTransfers.find(id);

    if (attrs.status === 'COMPLETED') {
      attrs.acceptanceStateAcceptable = false;
    }

    if (attrs.acceptanceToken !== transfer.acceptanceToken) {
      return new Response(500, {}, {
        errors: 'You must include the `id` and `acceptanceToken` in the PUT payload'
      });
    }

    if (transfer._shouldTriggerAcceptError) {
      return new Response(500, {}, {
        errors: 'Something went wrong.'
      })
    }

    // Mark all the tickets as transferable again
    attrs.ticketIds.forEach((ticketId) => {
      tickets.find(ticketId).update({
        ticketTransferTransferable: true,
        ticketTransferDescription: 'READY_TO_TRANSFER'
      });
    });

    // This prevents Mirage from causing Stack Overflow.
    transfer.ticketIds = attrs.ticketIds;
    delete attrs.ticketIds;


    return ticketTransfers.find(id).update(attrs);
  });

  this.post('/ticket-transfers', function({ ticketTransfers, tickets }, req) {
    // Move the content down a level
    const ticketTransfer = JSON.parse(req.requestBody);
    req.requestBody = JSON.stringify({ ticketTransfer });

    const params = this.normalizedRequestAttrs();

    const shouldError = params.ticketIds.find((id) => {
      const ticket = tickets.find(id);
      return ticket && ticket._shouldTriggerTransferError;
    });

    if (shouldError) {
      return new Response(500, {}, {
        errors: 'Something went wrong.'
      });
    }

    // Update the tickets to being not-transferable
    params.ticketIds.forEach((id) => {
      tickets.find(id).update({
        ticketTransferTransferable: false,
        ticketTransferDescription: 'TRANSFER_PENDING'
      });
    });

    return ticketTransfers.create(params);
  });

  this.get('/events/:id');

  this.get('/users/:userId/orgMemberships', authRoute(({ marketingMemberships }, req) => {
    const { params: { userId }, queryParams: { orgId } } = req;
    const { models } = marketingMemberships.where({ userId, orgId });

    return models.length ? marketingMemberships.where({ id: models[0].id }) : {
      memberships: [],
      meta: {
        defaultMemberships: [
          {
            defaultEmailSub: true,
            orgId: orgId
          }
        ]
      }
    };
  }));

  // No fat arrow as `this.normalizedRequestAttrs()` is set by mirage
  this.put('/orgMemberships/:orgMembershipId', authRoute(function(schema, { params: { orgMembershipId } }) {
    const { marketingMemberships, db: { marketingMemberships: marketingDb } } = schema;
    const attrs = this.normalizedRequestAttrs();

    marketingDb.update(orgMembershipId, attrs);

    return marketingMemberships.find(orgMembershipId);
  }));

  this.post('/orgMemberships', authRoute(function(schema) {
    const { marketingMemberships, db: { marketingMemberships: marketingDb } } = schema;
    const attrs = this.normalizedRequestAttrs();

    delete attrs.id; // don't update the ID.

    const { id } = marketingDb.insert(attrs);

    return marketingMemberships.find(id);
  }));
}
