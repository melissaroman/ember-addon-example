import engineResolverFor from 'ember-engines/test-support/engine-resolver-for';
import {
  moduleForComponent as qunitModuleForComponent,
  moduleFor as qunitModuleFor
} from 'ember-qunit';

function moduleForComponent(componentName, testName, options = {}) {
  options.resolver = engineResolverFor('ticket-transfer-addon');
  qunitModuleForComponent(componentName, testName, options);
}

function moduleFor(registryItem, testName, options = {}) {
  options.resolver = engineResolverFor('ticket-transfer-addon');
  qunitModuleFor(registryItem, testName, options);
}


export {
  moduleForComponent,
  moduleFor
};
