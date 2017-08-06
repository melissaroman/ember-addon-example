import { test } from 'qunit';
import { $hook } from 'ember-hook';
import moduleForAcceptance from '../helpers/module-for-acceptance';
import createTransfer from 'ticket-transfer-addon/mirage/scenarios/create-transfer';
import { authenticateSession, currentSession } from '../helpers/ember-simple-auth';

moduleForAcceptance('Acceptance | accept flow', {});

test('can accept tickets and it tracks the actions', function(assert) {
  const user = server.create('user');
  const { transfer, events: [event], transfer: { acceptanceToken } } = createTransfer(server);
  const queryString = `?acceptanceToken=${acceptanceToken}`;

  authenticate(this.application, user);

  visit(`/transfers/accept/${transfer.id}${queryString}`);

  andThen(() => {
    assert.equal(find($hook('tta_same_user_warning')).length, 0, 'the same user warning is not visible in this case');
    assert.ok(!server.db.marketingMemberships.length, 'there are no marketing memberships');
    assert.equal(currentURL(), `/transfers/accept/${transfer.id}/confirm${queryString}`);
    click($hook('tta_accept_button'));

    const trackPage = queryMetrics('trackPage');
    const { first } = trackPage;

    assert.equal(trackPage.length, 1, 'this page visit was tracked');
    assert.equal(first.eventName, event.name, 'we tracked the event name');
    assert.equal(first.eventId, event.id, 'we tracked the event id');
    assert.equal(first.orgId, event.organizationId, 'we tracked the orgId');
    assert.equal(first.orgName, event.organizationName, 'we tracked the orgName');

    const aliasUser = queryMetrics('alias');

    assert.equal(aliasUser.length, 1, 'the alias user metrics was created');
    assert.deepEqual(aliasUser.first, { alias: user.id }, 'alias was sent with user id');

    const identifyUser = queryMetrics('identify');

    assert.equal(identifyUser.length, 1, 'the alias user metrics was created');
    assert.deepEqual(identifyUser.first, {
      distinctId: user.id,
      firstName: user.firstName,
      lastName: user.lastName
    }, 'alias was sent with user id');
  });

  andThen(() => {
    assert.equal(currentURL(), `/transfers/accept/${transfer.id}/success${queryString}`);

    const updatedTransfer = server.schema.ticketTransfers.find(transfer.id);
    const length = updatedTransfer.ticketIds.length;

    assert.equal(updatedTransfer.status, 'COMPLETED', 'the transfer was accepted');
    assert.equal(length, 4, 'all four tickets were accepted');
    assert.equal($hook('tta_accept_header_text').text().trim(), `${transfer.senderFirstName} sent you tickets.`);
    assert.equal($hook('tta_accept_success_message').text().trim(), 'Tickets accepted!', 'there is a success message');
    assert.ok(server.db.marketingMemberships.length, 'a marketing memberships was created and saved');

    const { first } = queryMetrics('trackEvent');

    assert.deepEqual(first, {
      event: 'transfer acceptance',
      isProbablyNewUser: false,
      transferId: transfer.id,
      marketingPreferenceOptIn: true,
      newOptInToOrg: false,
      changedMarketingPreference: false,
      numberOfTicketsAccepted: length,
      eventName: event.name,
      eventId: event.id,
      orgId: event.organizationId,
      orgName: event.organizationName
    }, 'the transfer acceptance event metric was sent');
  });
});

test('cannot directly navigate to success screen', function(assert) {
  const user = server.create('user');
  const { transfer, transfer: { acceptanceToken } } = createTransfer(server);
  const queryString = `?acceptanceToken=${acceptanceToken}`;

  authenticate(this.application, user);

  visit(`/transfers/accept/${transfer.id}/success${queryString}`);

  andThen(() => {
    assert.equal(currentURL(), `/transfers/accept/${transfer.id}/confirm${queryString}`);
  });
});

test('the promotions checkbox will default to checked if it has a truthy marketing preference', function(assert) {
  const user = server.create('user');
  const { transfer, events: [event], transfer: { acceptanceToken }, marketingMemberships: [pref] } = createTransfer(server, {
    createMarketingPreference: true,
    marketingPreferenceConfig: {
      emailSubscription: true,
      userId: user.id
    }
  });

  const queryString = `?acceptanceToken=${acceptanceToken}`;
  authenticate(this.application, user);

  visit(`/transfers/accept/${transfer.id}${queryString}`);

  andThen(() => {
    assert.equal(currentURL(), `/transfers/accept/${transfer.id}/confirm${queryString}`);
    assert.ok($hook('tta_accept_promotions').find('input').is(':checked'), 'the checkbox is checked');

    click($hook('tta_accept_promotions').find('input'));
    click($hook('tta_accept_button'));
  });

  andThen(() => {
    const updatedPref = server.db.marketingMemberships.find(pref.id);
    assert.equal(updatedPref.emailSubscription, false, 'the marketing preference was updated');

    const { first } = queryMetrics('trackEvent');
    assert.equal(first.marketingPreferenceOptIn, false, 'opt in event was false');
    assert.equal(first.changedMarketingPreference, true, 'opt in event was changed');
    assert.equal(first.newOptInToOrg, false, 'is new opt in to org');
    assert.equal(first.eventName, event.name, 'we tracked the event name');
    assert.equal(first.eventId, event.id, 'we tracked the event id');
    assert.equal(first.orgId, event.organizationId, 'we tracked the orgId');
    assert.equal(first.orgName, event.organizationName, 'we tracked the orgName');
  });
});

test('the promotions checkbox will default to unchecked if it has a falsey marketing preference', function(assert) {
  const user = server.create('user');
  const { transfer, transfer: { acceptanceToken }, marketingMemberships: [pref] } = createTransfer(server, {
    createMarketingPreference: true,
    marketingPreferenceConfig: {
      emailSubscription: false,
      userId: user.id
    }
  });

  const queryString = `?acceptanceToken=${acceptanceToken}`;
  authenticate(this.application, user);

  visit(`/transfers/accept/${transfer.id}${queryString}`);

  andThen(() => {
    assert.equal(currentURL(), `/transfers/accept/${transfer.id}/confirm${queryString}`);
    assert.ok(!$hook('tta_accept_promotions').find('input').is(':checked'), 'the checkbox is not checked');

    click($hook('tta_accept_promotions').find('input'));
    click($hook('tta_accept_button'));
  });

  andThen(() => {
    const updatedPref = server.db.marketingMemberships.find(pref.id);
    assert.equal(updatedPref.emailSubscription, true, 'the marketing preference was updated');

    const { first } = queryMetrics('trackEvent');
    assert.equal(first.marketingPreferenceOptIn, true, 'opt in event was false');
    assert.equal(first.changedMarketingPreference, true, 'opt in event was changed');
    assert.equal(first.newOptInToOrg, true, 'is new opt in to org');
  });
});

test('is redirected to login screen if accepting, but not logged in', function(assert) {
  const user = server.create('user');
  const { transfer, transfer: { acceptanceToken } } = createTransfer(server);
  const queryString = `?acceptanceToken=${acceptanceToken}`;

  visit(`/transfers/accept/${transfer.id}${queryString}`);

  andThen(() => {
    assert.equal(currentURL(), '/test-login');
    authenticate(this.application, user);
  });

  andThen(() => {
    assert.equal(currentURL(), `/transfers/accept/${transfer.id}/confirm${queryString}`, 'after logging in, we are taken back to accept');
  });
});

test('can show error on unsuccessful accept', function(assert) {
  const user = server.create('user');
  const { transfer, events: [event], transfer: { acceptanceToken } } = createTransfer(server, {
    transferTraits: ['errorsOnTransfer'],
  });
  const queryString = `?acceptanceToken=${acceptanceToken}`;

  authenticate(this.application, user);

  visit(`/transfers/accept/${transfer.id}${queryString}`);

  andThen(() => {
    assert.equal(currentURL(), `/transfers/accept/${transfer.id}/confirm${queryString}`);
    click($hook('tta_accept_button'));
  });

  andThen(() => {
    assert.equal($hook('tta_toast').text().trim(), 'We are unable to complete your request. Please try again later.', 'there is an error toast');
    assert.equal(currentURL(), `/transfers/accept/${transfer.id}/confirm${queryString}`);

    const { first } = queryMetrics('trackEvent');

    assert.equal(first.event, 'error on transfer acceptance', 'the error tracking event was sent');
    assert.ok(first.error.indexOf('Error: Assertion Failed: `AdapterError` expects json-api formatted errors array.') > -1, 'the error message was also send');
    assert.equal(first.eventName, event.name, 'we tracked the event name');
    assert.equal(first.eventId, event.id, 'we tracked the event id');
    assert.equal(first.orgId, event.organizationId, 'we tracked the orgId');
    assert.equal(first.orgName, event.organizationName, 'we tracked the orgName');
  });
});

test('cancelled transfer state is displayed properly', function(assert) {
  const user = server.create('user');
  const { transfer, transfer: { acceptanceToken } } = createTransfer(server, {
    transferTraits: ['cancelledStatus'],
  });

  authenticate(this.application, user);

  const queryString = `?acceptanceToken=${acceptanceToken}`;

  visit(`/transfers/accept/${transfer.id}${queryString}`);

  andThen(() => {
    assert.equal($hook('tta_accept_header_text').text().trim(), 'Ticket transfer cancelled.');
    assert.equal($hook('tta_accept_complete_ticket_row_status').eq(0).text().trim(), 'Cancelled');
  });
});

test('declined transfer state is displayed properly', function(assert) {
  const user = server.create('user');
  const { transfer, transfer: { acceptanceToken } } = createTransfer(server, {
    transferTraits: ['deniedStatus'],
  });

  authenticate(this.application, user);

  const queryString = `?acceptanceToken=${acceptanceToken}`;

  visit(`/transfers/accept/${transfer.id}${queryString}`);

  andThen(() => {
    assert.equal($hook('tta_accept_header_text').text().trim(), 'Ticket transfer declined.');
    assert.equal($hook('tta_accept_complete_ticket_row_status').eq(0).text().trim(), 'Declined');
  });
});

test('already accepted transfer state is displayed properly', function(assert) {
  const user = server.create('user');
  const { transfer, transfer: { acceptanceToken } } = createTransfer(server, {
    transferTraits: ['acceptedStatus'],
  });

  authenticate(this.application, user);

  const queryString = `?acceptanceToken=${acceptanceToken}`;

  visit(`/transfers/accept/${transfer.id}${queryString}`);

  andThen(() => {
    assert.equal($hook('tta_accept_header_text').text().trim(), 'You can no longer accept this transfer because it has already been accepted.', 'message regarding tickets already having been accepted');
  });
});

test('not acceptable acceptanceState is displayed properly', function(assert) {
  const user = server.create('user');
  const { transfer, transfer: { acceptanceToken } } = createTransfer(server, {
    transferTraits: ['notAcceptableStatus'],
  });

  authenticate(this.application, user);

  const queryString = `?acceptanceToken=${acceptanceToken}`;

  visit(`/transfers/accept/${transfer.id}${queryString}`);

  andThen(() => {
    assert.equal($hook('tta_accept_header_text').text().trim().replace(/[\s\n]+/g, ' '), 'You can no longer accept this transfer. Status: Invalid / Scanned', 'message regarding tickets acceptance status');
  });
});

test('user is prompted to enter first name / last name if no existing first name / last name is found', function(assert) {
  const user = server.create('user', {
    firstName: '',
    lastName: ''
  });

  const { transfer, transfer: { acceptanceToken } } = createTransfer(server);
  const queryString = `?acceptanceToken=${acceptanceToken}`;

  authenticate(this.application, user);

  visit(`/transfers/accept/${transfer.id}${queryString}`);

  let prevUrl;
  andThen(() => {
    prevUrl = currentURL();
    fillIn($hook('tta_validating_input').eq(0), 'Spencer');
    keyEvent($hook('tta_validating_input').eq(0), 'keyup');
    click($hook('tta_accept_button'));
  });

  andThen(() => {
    assert.equal(prevUrl, currentURL(), 'the accept click was blocked due to invalid name');
    fillIn($hook('tta_validating_input').eq(1), 'Price');
    keyEvent($hook('tta_validating_input').eq(1), 'keyup');
  });

  andThen(() => {
    click($hook('tta_accept_button'));
  });

  andThen(() => {
    const dbUser = server.db.users.find(user.id);

    assert.notEqual(prevUrl, currentURL(), 'with a valid name, we have proceeded');
    assert.equal(dbUser.firstName, 'Spencer');
    assert.equal(dbUser.lastName, 'Price');

    const identifyUser = queryMetrics('identify');

    assert.deepEqual(identifyUser.first, {
      distinctId: user.id,
      firstName: '',
      lastName: ''
    }, 'the original identify did not include names');

    assert.deepEqual(identifyUser.last, {
      distinctId: user.id,
      firstName: 'Spencer',
      lastName: 'Price'
    }, 'the subsequent identify did include names');

    const { first: { isProbablyNewUser } } = queryMetrics('trackEvent');

    assert.ok(isProbablyNewUser, 'metrics track this as `probablyANewUser`');
  });
});

test('user is not prompted to enter first name / last name if existing first name / last name is found', function(assert) {
  const user = server.create('user', {
    firstName: 'Spencer',
    lastName: 'Price'
  });

  const { transfer, transfer: { acceptanceToken } } = createTransfer(server);
  const queryString = `?acceptanceToken=${acceptanceToken}`;

  authenticate(this.application, user);

  visit(`/transfers/accept/${transfer.id}${queryString}`);

  andThen(() => {
    assert.equal(find($hook('tta_validating_input').eq(0)).length, 0);
    assert.equal(find($hook('tta_validating_input').eq(1)).length, 0);
  });

  andThen(() => {
    const dbUser = server.db.users.find(user.id);

    assert.equal(dbUser.firstName, 'Spencer');
    assert.equal(dbUser.lastName, 'Price');
  });
});

test('if user has either a first or last name, but not both, inputs are displayed and contain name', function(assert) {
  const user = server.create('user', {
    firstName: 'Spencer',
    lastName: ''
  });

  const { transfer, transfer: { acceptanceToken } } = createTransfer(server);
  const queryString = `?acceptanceToken=${acceptanceToken}`;

  authenticate(this.application, user);

  visit(`/transfers/accept/${transfer.id}${queryString}`);

  andThen(() => {
    assert.equal(find($hook('tta_validating_input').eq(0)).val(), 'Spencer');
    assert.equal(find($hook('tta_validating_input').eq(1)).val(), '');
  });
});

test('can view and leave the terms and conditions', function(assert) {
  const user = server.create('user');
  const { transfer, transfer: { acceptanceToken } } = createTransfer(server);
  const queryString = `?acceptanceToken=${acceptanceToken}`;

  authenticate(this.application, user);

  visit(`/transfers/accept/${transfer.id}${queryString}`);

  andThen(() => {
    click($hook('tta_accept_tandc'));
  });

  andThen(() => {
    assert.equal(currentURL(), `/transfers/accept/${transfer.id}/confirm/terms${queryString}`);

    click($hook('tta_accept_tandc_back'));
  });

  andThen(() => {
    assert.equal(currentURL(), `/transfers/accept/${transfer.id}/confirm${queryString}`);

    click($hook('tta_accept_tandc'));
  });

  andThen(() => {
    assert.equal(currentURL(), `/transfers/accept/${transfer.id}/confirm/terms${queryString}`);

    keyPress('Escape');
  });

  andThen(() => {
    assert.equal(currentURL(), `/transfers/accept/${transfer.id}/confirm${queryString}`);
  });
});

test('an alert is shown if the user is accepting to itself', function(assert) {
  const user = server.create('user');
  const { transfer, transfer: { acceptanceToken } } = createTransfer(server, {
    transferConfig: {
      senderEmail: user.email
    }
  });
  const queryString = `?acceptanceToken=${acceptanceToken}`;

  authenticate(this.application, user);

  visit(`/transfers/accept/${transfer.id}${queryString}`);

  andThen(() => {
    assert.equal(find($hook('tta_same_user_warning')).length, 1);
  });
});

function authenticate(application, user) {
  const session = currentSession(application);

  return authenticateSession(application, {
    access_token: user._authToken
  }).then(() => {
    // This simulates some of Simple Auth's Behavior.
    const transition = session.get('attemptedTransition');
    if (transition) {
      transition.retry();
    }
  });
}
