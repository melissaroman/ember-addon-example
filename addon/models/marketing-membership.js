import Model from 'ember-data/model';
import attr from 'ember-data/attr'

export default Model.extend({
  userId: attr('string'),
  orgId: attr('string'),
  emailSubscription: attr('boolean')
});
