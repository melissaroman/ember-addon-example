import { test } from 'ember-qunit';
import { moduleFor } from 'dummy/tests/helpers/test-module-for-engine';
import sinon from 'sinon';
import RSVP from 'rsvp';
import run from 'ember-runloop';
const { resolve } = RSVP;
import { A } from 'ember-array/utils';

moduleFor('route:accept/confirm', 'Unit | Route | accept/confirm', {
  needs: [],
  beforeEach() {
    this.register('service:metrics', {}, { instantiate: false });
  }
});

test('it exists', function(assert) {
  const route = this.subject();
  assert.ok(route);
});

test('if defaultMemberships array exists and orgId is correct, it returns correct defaultEmailSub value', function(assert) {
  const route = this.subject();

  const meta = {
    defaultMemberships: [
      {
        defaultEmailSub: false,
        orgId: 1
      }
    ]
  }

  const emailSub = route.defaultValueForOrg({ meta }, 1);

  assert.equal(emailSub, false, 'it returns false');
});

test('if defaultMemberships array exists and orgId is a string, it returns correct defaultEmailSub value', function(assert) {
  const route = this.subject();

  const meta = {
    defaultMemberships: [
      {
        defaultEmailSub: false,
        orgId: 1
      }
    ]
  }

  const emailSub = route.defaultValueForOrg({ meta }, "1");

  assert.equal(emailSub, false, 'it returns false');
});

test('if the orgId is incorrect, it returns the default value true', function(assert) {
  const route = this.subject();

  const meta = {
    defaultMemberships: [
      {
        defaultEmailSub: true,
        orgId: 1
      }
    ]
  }

  const orgDefaultValue = route.defaultValueForOrg({ meta }, 4);

  assert.equal(orgDefaultValue, true, 'it returns true');
});

test('if the no meta object is present, it returns the detault value true', function(assert) {
  const route = this.subject();
  const orgDefaultValue = route.defaultValueForOrg({}, 4);

  assert.equal(orgDefaultValue, true, 'it returns true');
});

test('if membership exists, return membership', async function(assert) {
  const route = this.subject();
  const eventPromise = resolve({ organizationId: 1 });
  const userPromise = resolve({ id: 2 });
  const store = route.get('store');
  const queryStub = sinon.stub(store, 'query');
  const membershipStub = {};
  queryStub.returns(resolve(A([membershipStub])));

  const membership = await run(() => {
    return route.get('getMarketingPreference').perform(eventPromise, userPromise);
  });

  assert.equal(membership, membershipStub, 'resolves with membership');
  assert.ok(queryStub.getCall(0).calledWithExactly('marketing-membership', { userId: 2, orgId: 1 }));
});

test('if membership does not exist, run defaultValueForOrg method', async function(assert) {
  const route = this.subject();
  const eventPromise = resolve({ organizationId: 1 });
  const userPromise = resolve({ id: 2 });
  const store = route.get('store');
  const queryStub = sinon.stub(store, 'query');
  const createStub = sinon.stub(store, 'createRecord');

  queryStub.returns(resolve(A([])));

  const initialMembership = {};
  const defaultValueForOrgStub = sinon.stub(route, 'defaultValueForOrg');

  createStub.returns(initialMembership);
  defaultValueForOrgStub.returns(true);

  const membership = await run(() => {
    return route.get('getMarketingPreference').perform(eventPromise, userPromise);
  });

  assert.equal(membership, initialMembership, 'resolves with membership');
  assert.ok(createStub.getCall(0).calledWithExactly('marketing-membership', {
    userId: 2,
    orgId: 1,
    emailSubscription: true
  }));
});
