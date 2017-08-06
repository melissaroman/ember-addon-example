import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import service from 'ember-service/inject';
import get, { getProperties } from 'ember-metal/get';

export default Model.extend({
  metrics: service(),

  firstName: attr('string'),
  lastName: attr('string'),
  email: attr('string'),

  identifyUserForMetrics() {
    const metrics = get(this, 'metrics');
    const { id, firstName, lastName } = getProperties(this, 'firstName', 'lastName', 'id');

    metrics.alias({ alias: id });
    metrics.identify({ distinctId: id, firstName, lastName });
  }
});
