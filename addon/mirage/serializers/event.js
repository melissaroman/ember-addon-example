import { RestSerializer } from 'ember-cli-mirage';
import { makeMergeConfig, getHashForResource } from '../helpers/merge-object-properties';

export default RestSerializer.extend({
  getHashForResource,

  serialize() {
    const json = RestSerializer.prototype.serialize.apply(this, arguments);

    // Move the venue into its own array and give it an ID.
    const { event, event: { venue } } = json;
    delete event.venue;
    event.venueId = event.id;
    venue.id = event.id;

    return { event, venues: [venue] };
  },

  mergedConfigs: [
    makeMergeConfig('venue', 'venue', {
      venueCity: 'address.city',
      venueState: 'address.stateCode',
    })
  ]
});
