import Model from 'ember-data/model';
import attr from 'ember-data/attr';

export default Model.extend({
  organizationName: attr('string'),
  name: attr('string'),
  venueName: attr('string'),
  topLineInfo: attr('string'),
  bottomLineInfo: attr('string'),
  customTermsAndConditions: attr('string'),
  additionalInfo: attr('string'),
  onSaleTime: attr('string'),
  doorTime: attr('string'),
  startTime: attr('string'),
  endTime: attr('string'),
  offSaleTime: attr('string'),
  displayPrice: attr('string'),
  ageLimit: attr('string'),
  status: attr('string'),
  statusMessage: attr('string'),
  imageUrls: attr(),
  purchaseUrl: attr('string'),
  purchaseFeatureDependencies: attr(),
  venue: attr(),
  organizationId: attr()
});
