import { test } from 'ember-qunit';
import { moduleFor } from 'dummy/tests/helpers/test-module-for-engine';
import RSVP from 'rsvp';
import sinon from 'sinon';

const { resolve } = RSVP;

moduleFor('route:accept/index', 'Unit | Route | accept/index', {
  needs: [],
  beforeEach() {
    this.register('service:metrics', {}, { instantiate: false });
  }
});

test('it redirects to `confirm` if the transfer is accpetable', async function(assert) {
  const replaceWith = sinon.stub();
  const route = this.subject({ replaceWith });
  const transfer = resolve({ isAcceptable: true });

  await route.afterModel({ transfer });

  assert.ok(replaceWith.getCall(0).calledWithExactly('accept.confirm'));
});

test('it does not redirect to `confirm` if the transfer is not accpetable', async function(assert) {
  const replaceWith = sinon.stub();
  const route = this.subject({ replaceWith });
  const transfer = resolve({ isAcceptable: false });

  await route.afterModel({ transfer });

  assert.equal(replaceWith.callCount, 0, 'no redirect');
});
