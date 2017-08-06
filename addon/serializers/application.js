import { singularize } from 'ember-inflector';
import RESTSerializer from 'ember-data/serializers/rest';

export default RESTSerializer.extend({
  keyForRelationship(key, typeClass) {
    return typeClass === 'belongsTo' ? `${key}Id` : `${singularize(key)}Ids`;
  }
});
