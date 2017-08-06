import { RestSerializer } from 'ember-cli-mirage';

export default RestSerializer.extend({
  keyForModel() {
    return 'membership';
  },
  keyForCollections() {
    return 'memberships';
  }
});
