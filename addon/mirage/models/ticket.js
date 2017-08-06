import { Model, belongsTo } from 'ember-cli-mirage';

export default Model.extend({
  event: belongsTo(),
  ticketTransfer: belongsTo(),
  user: belongsTo()
});
