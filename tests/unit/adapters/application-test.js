import get from 'ember-metal/get';
import { test } from 'ember-qunit';
import { moduleFor } from 'dummy/tests/helpers/test-module-for-engine';
import sinon from 'sinon';

moduleFor('adapter:application', 'Unit | Adapter | application', {
  needs: [],
  beforeEach() {
    this.register('service:session', {}, { instantiate: false });
  }
});

test('it looks up auth token on the session service', function(assert) {
  this.register('service:session', {
    authorize(authorizer, block) {
      block('Authorization', 'Bearer 1234');
    }
  }, { instantiate: false });

  const adapter = this.subject();
  const setRequestHeader = sinon.stub();
  adapter.ajaxOptions().beforeSend({ setRequestHeader });

  assert.ok(setRequestHeader.getCall(0).calledWithExactly('Authorization', 'Bearer 1234'));
});

test('it uses the configuration for host and namespace', function(assert) {
  const adapter = this.subject();

  assert.equal(get(adapter, 'host'), 'localhost:9000');
  assert.equal(get(adapter, 'namespace'), 'v2');
});
