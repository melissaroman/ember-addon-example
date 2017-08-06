import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'ember-data/relationships';
import { alias } from 'ember-computed';

export default Model.extend({
  code: attr('string'),
  deliveryMethod: attr('string'),
  properties: attr(),

  row: alias('properties.row'),
  seat: alias('properties.seat'),
  section: alias('properties.section'),
  variantDescription: alias('properties.variantDescription'),
  variantName: alias('properties.variantName'),

  transferState: attr(),
  transfer: belongsTo('ticket-transfer', { async: false }),
  event: belongsTo('event', { async: true })
});
