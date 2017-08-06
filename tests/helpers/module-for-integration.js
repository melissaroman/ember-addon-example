import RSVP from 'rsvp';
import { bind } from 'ember-runloop';
import { module as qunitModule } from 'qunit';
import { TestModuleForIntegration } from 'ember-test-helpers';
import { test as emberTest } from 'ember-qunit';

const { resolve } = RSVP;

export function moduleForIntegration(name, callbacks = {}) {
  const { beforeEach, afterEach } = callbacks;
  delete callbacks.beforeEach;
  delete callbacks.afterEach;

  const module = new TestModuleForIntegration(name, name, callbacks);

  qunitModule(module.name, {
    beforeEach() {
      module.setContext(this);

      return module.setup(...arguments).then(() => {
        if (beforeEach) {
          return beforeEach.apply(this, arguments);
        }
      });
    },
    afterEach() {
      let result;

      if (afterEach) {
        result = afterEach.apply(this, arguments);
      }

      return resolve(result).then(() => module.teardown(...arguments));
    }
  });
}

export function test(name, callback) {
  return emberTest(name, function() {
    return bind(this, callback)(...arguments);
  });
}
