import { RestSerializer } from 'ember-cli-mirage';
import { makeMergeConfig, getHashForResource } from '../helpers/merge-object-properties';
import uniqueItems from '../helpers/unique-items';

export default RestSerializer.extend({
  getHashForResource,

  serialize(payload, request) {
    const serialized = RestSerializer.prototype.serialize.call(this, payload, request);

    // TODO: Remove this as it's simulating the bug in COM-2141.
    if (request.method === 'PUT') {
      serialized.ticketTransfer.ticketIds = serialized.ticketTransfer.ticketIds.map(() => null);
      delete serialized.tickets;
    }

    // For some reason, Mirage adds both the `ticketTransfer` & `ticketTransfers` properties
    delete serialized.ticketTransfers;

    // Make sure tickets array is unique.🙄 <- Mirage
    serialized.tickets = uniqueItems(serialized.tickets);

    return serialized;
  },

  include: ['tickets'],

  mergedConfigs: [
    makeMergeConfig('recipient', 'recipient'),
    makeMergeConfig('sender', 'sender'),
    makeMergeConfig('acceptanceState', 'acceptanceState')
  ]
});
