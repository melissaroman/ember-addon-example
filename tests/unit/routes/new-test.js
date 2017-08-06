import { test } from 'ember-qunit';
import { moduleFor } from 'dummy/tests/helpers/test-module-for-engine';
import RSVP from 'rsvp';
import sinon from 'sinon';
const { resolve, hash } = RSVP;

moduleFor('route:new', 'Unit | Route | new', {
  needs: [],
  beforeEach() {
    this.register('service:metrics', {}, { instantiate: false });
    this.register('service:session', {}, { instantiate: false });
  }
});

test('required ticket query parameters are all present', async function(assert) {
  const query = sinon.stub();
  const queryRecord = sinon.stub().returns(resolve({ id: '2' }));

  this.register('service:store', {
    queryRecord,
    query,
    find() {}
  }, { instantiate: false });

  const route = this.subject();
  await hash(route.model({ orderId: '1234', eventId: '9876' }));

  assert.equal(query.getCall(0).args[1].transferredTickets, true, 'the transferred tickets was added to the query');
  assert.equal(query.getCall(0).args[1].orderId, 1234, 'the sale code was added to the query');
  assert.equal(query.getCall(0).args[1].include, 'transfers', 'the include was added to the query');
  assert.equal(query.getCall(0).args[1].eventId, 9876, 'the event id was added to the query');
});
