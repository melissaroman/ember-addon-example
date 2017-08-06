import { pluralize } from 'ember-inflector';
import RESTAdapter from 'ember-data/adapters/rest';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
import config from '../config/environment';

const {
  ticketflyAPI: { host, namespace }
} = config;

export default RESTAdapter.extend(DataAdapterMixin, {
  host,
  namespace,
  authorizer: 'authorizer:oauth2',

  pathForType(modelName) {
    return pluralize(modelName);
  }
});
