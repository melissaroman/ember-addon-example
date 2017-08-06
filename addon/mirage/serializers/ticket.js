import { RestSerializer } from 'ember-cli-mirage';
import { makeMergeConfig, getHashForResource } from '../helpers/merge-object-properties';
import uniqueItems from '../helpers/unique-items';

export default RestSerializer.extend({
  getHashForResource,

  include: ['ticketTransfer'],

  serialize() {
    const json = RestSerializer.prototype.serialize.apply(this, arguments);

    // Make sure tickets array is unique.🙄 <- Mirage
    json.tickets = uniqueItems(json.tickets);

    return json;
  },

  mergedConfigs: [
    makeMergeConfig('properties', 'properties'),
    makeMergeConfig('ticketTransfer', 'transferState', {
      ticketTransferId: 'transferId'
    })
  ]
});
