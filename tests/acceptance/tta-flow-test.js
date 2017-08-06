import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import { $hook } from 'ember-hook';
import createOrder from 'ticket-transfer-addon/mirage/scenarios/create-order';
import { authenticateSession } from '../../tests/helpers/ember-simple-auth';

const accessToken = '1234';

moduleForAcceptance('Acceptance | tta flow', {
  beforeEach() {
    this.user = server.create('user', {
      _authToken: accessToken
    });

    return authenticateSession(this.application, {
      access_token: accessToken
    });
  }
});

test('can escape ticket transfer app', function(assert) {
  assert.expect(3);
  const {
    tickets: [{ orderId }],
    events: [{ id: eventId }]
  } = createOrder(server);

  visit(`/transfers/new/${orderId}/${eventId}`);

  andThen(() => {
    assert.equal(currentURL(), `/transfers/new/${orderId}/${eventId}`, 'routes are injected');
    assert.equal($hook('tta_title').text().trim(), 'Transfer Tickets', 'page rendered correctly');

    click($hook('tta_close_transfer_app'));
  });

  andThen(() => {
    assert.equal(currentURL(), '/', 'transfer app closed');
  });
});

test('can select tickets to transfer and successfully transfer them and track the events', function(assert) {
  setBreakpoint('greaterThanMobile');
  const orderId = '1';
  const { tickets, events: [event] } = createOrder(server, {
    ticketsPerEvent: 4,
    ticketConfig: {
      orderId: '1',
      userId: this.user.id
    }
  });

  visit(`/transfers/new/${orderId}/${event.id}`);

  andThen(() => {
    assert.equal($hook('tta_ticket_row').length, tickets.length, 'all tickets are rendered');
    assert.equal($hook('tta_ticket_row_checkbox').length, tickets.length, 'and all have checkboxes');
    assert.equal($hook('tta_ticket_row_checkbox', { checked: true }).length, 0, 'but none are checked');
    assert.ok($hook('tta_transfer_button', { enabled: false }).length, 'the transfer button is disabled');

    const trackPage = queryMetrics('trackPage');
    const { first } = trackPage;

    assert.equal(trackPage.length, 1, 'this page visit was tracked');
    assert.equal(first.eventName, event.name, 'we tracked the event name');
    assert.equal(first.eventId, event.id, 'we tracked the event id');
    assert.equal(first.orgId, event.organizationId, 'we tracked the orgId');
    assert.equal(first.orgName, event.organizationName, 'we tracked the orgName');

    const aliasUser = queryMetrics('alias');
    const { user } = this;

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
    click($hook('tta_ticket_row').eq(0));
    click($hook('tta_ticket_row').eq(1));
  });

  andThen(() => {
    assert.equal($hook('tta_ticket_row_checkbox', { checked: true }).length, 2, 'two are checked');
    assert.ok($hook('tta_transfer_button', { enabled: false }).length, 'the transfer button is still disabled');
  });

  andThen(() => {
    fillIn($hook('tta_validating_input'), this.user.email);
  });

  andThen(() => {
    assert.ok($hook('tta_transfer_button', { enabled: false }).length, 'the transfer button is still disabled since attempting to transfer to self');
    assert.equal($hook('tta_validating_input_error').text().trim(), 'You cannot transfer these tickets to yourself.')

    fillIn($hook('tta_validating_input'), 'spencer.price@ticketfly.com');
  });

  andThen(() => {
    assert.ok($hook('tta_transfer_button', { enabled: true }).length, 'the transfer button is enabled');

    // Add a message
    click($hook('tta_personal_message_add'));
  });

  andThen(() => {
    const input = $hook('tta_personal_message_input');
    fillIn(input, 'Enjoy the show!');
    keyEvent(input, 'keyup');
    triggerEvent(input, 'blur');
  });

  andThen(() => {
    click($hook('tta_transfer_button'));
  });

  andThen(() => {
    assert.ok($hook('tta_confirmation_modal').length, 'the confirmation modal is visible');
    keyPress('Escape');
  });

  andThen(() => {
    assert.ok(!$hook('tta_confirmation_modal').length, 'the confirmation modal is hidden after an escape press');
    click($hook('tta_transfer_button'));
  });

  andThen(() => {
    assert.ok($hook('tta_confirmation_modal').length, 'the confirmation modal is visible');
    assert.equal($hook('tta_grouped_tickets_ticket').length, 2, '2 tickets are being confirmed');
    assert.equal($hook('tta_confirmation_modal_email').text().trim(), 'spencer.price@ticketfly.com', 'confirm email is visible');

    // Visit the Terms and Conditions
    click($hook('tta_confirmation_modal_tandc'));
  });

  andThen(() => {
    assert.ok($hook('tta_confirmation_modal_tandc_text').length, 'the terms text is visible');
    click($hook('tta_confirmation_modal_tandc_back'));
  });

  andThen(() => {
    click($hook('tta_confirmation_modal_transfer_button'));
  });

  andThen(() => {
    // TODO: When testing for ember-concurrency gets better, we can add an assert that the Succeess Modal
    // shows up for a period of time.
    click($hook('tta_confirmation_success_done'));
  });

  andThen(() => {
    assert.equal($hook('tta_confirmation_modal').length, 0, 'the confirmation modal is hidden again');

    assert.equal($hook('tta_ticket_row_transfer_status').length, 2, 'two tickets show transferred status');
    assert.ok($hook('tta_ticket_row_transfer_status').eq(0).text().indexOf('spencer.price@ticketfly.com') > -1, 'the email is visible too');
    assert.equal($hook('tta_ticket_row_checkbox').length, tickets.length - 2, 'the remaining have checkboxes');
    assert.equal($hook('tta_ticket_row', { selected: false }).length, tickets.length, 'all tickets should be deselected');
    assert.equal($hook('tta_validating_input').val(), '', 'The email  was cleared');
    assert.equal($hook('tta_personal_message_input').val(), '', 'The message input was cleared');

    // Check to see that mirage captured the message.
    const [transfer] = server.db.ticketTransfers;

    assert.equal(transfer.message, 'Enjoy the show!', 'the message was included in the transfer');

    const { first } = queryMetrics('trackEvent');

    assert.deepEqual(first, {
      event: 'created transfer',
      numberOfTickets: 2,
      transferId: transfer.id,
      eventName: event.name,
      eventId: event.id,
      orgId: event.organizationId,
      orgName: event.organizationName
    }, 'the transfer creation event was sent')
  });
});

test('error shows on unsuccessful transfer', function(assert) {
  const orderId = '1';
  const { tickets, events: [event] } = createOrder(server, {
    ticketsPerEvent: 4,
    ticketTraits: ['errorsOnTransfer'],
    ticketConfig: {
      orderId: '1',
      userId: this.user.id
    }
  });

  visit(`/transfers/new/${orderId}/${event.id}`);

  andThen(() => {
    assert.equal($hook('tta_ticket_row').length, tickets.length, 'all tickets are rendered');
    assert.equal($hook('tta_ticket_row_checkbox').length, tickets.length, 'and all have checkboxes');
    assert.equal($hook('tta_ticket_row_checkbox', { checked: true }).length, 0, 'but none are checked');
    assert.ok($hook('tta_transfer_button', { enabled: false }).length, 'the transfer button is disabled');
  });

  andThen(() => {
    click($hook('tta_ticket_row').eq(0));
    click($hook('tta_ticket_row').eq(1));
  });

  andThen(() => {
    assert.equal($hook('tta_ticket_row_checkbox', { checked: true }).length, 2, 'two are checked');
    assert.ok($hook('tta_transfer_button', { enabled: false }).length, 'the transfer button is still disabled');
  });

  andThen(() => {
    fillIn($hook('tta_validating_input'), 'spencer.price@ticketfly.com');
  });

  andThen(() => {
    assert.ok($hook('tta_transfer_button', { enabled: true }).length, 'the transfer button is enabled');
    click($hook('tta_transfer_button'));
  });

  andThen(() => {
    assert.ok($hook('tta_confirmation_modal').length, 'the confirmation modal is visible');
    assert.equal($hook('tta_grouped_tickets_ticket').length, 2, '2 tickets are being confirmed');
    assert.equal($hook('tta_confirmation_modal_email').text().trim(), 'spencer.price@ticketfly.com', 'confirm email is visible');
    click($hook('tta_confirmation_modal_transfer_button'));
  });

  andThen(() => {
    assert.ok($hook('tta_confirmation_modal').length, 'the confirmation modal is visible again');
    assert.equal($hook('tta_toast').text().trim(), 'Your transfer request encountered an error. Please try again later.', 'there is an error toast');

    const { first } = queryMetrics('trackEvent');

    assert.equal(first.event, 'error on create transfer', 'an error event was sent');
    assert.ok('error' in first, 'there is also an error message');
    assert.equal(first.eventId, event.id, 'event id is tracked');
    assert.equal(first.eventName, event.name, 'event name is tracked');
    assert.equal(first.orgId, event.organizationId, 'org id is tracked');
    assert.equal(first.orgName, event.organizationName, 'org name is tracked');
  });
});

test('error shows when no tickets in an order', function(assert) {
  const orderId = '1';
  const { events: [{ id: eventId }] } = createOrder(server, { ticketsPerEvent: 0 });

  visit(`/transfers/new/${orderId}/${eventId}`);

  andThen(() => {
    assert.equal($hook('tta_transfer_error_text').text().trim(), 'No transferable tickets found.', 'the error is displayed');
    assert.equal($hook('tta_toast').text().trim(), 'Error: No transferable tickets.', 'there is an error toast');
  });
});

test('routes under `new` redirect if a selection has not been made', function(assert) {
  const orderId = '1';
  const { events: [{ id: eventId }] } = createOrder(server, {
    ticketConfig: {
      orderId,
      userId: this.user.id
    }
  });

  visit(`/transfers/new/${orderId}/${eventId}/m/confirm`);

  andThen(() => {
    assert.equal(currentURL(), `/transfers/new/${orderId}/${eventId}`, 'routes back to `new`');
    visit(`/transfers/new/${orderId}/${eventId}/m/terms`);
  });

  andThen(() => {
    assert.equal(currentURL(), `/transfers/new/${orderId}/${eventId}`, 'routes back to `new`');
    visit(`/transfers/new/${orderId}/${eventId}/m/success`);
  });

  andThen(() => {
    assert.equal(currentURL(), `/transfers/new/${orderId}/${eventId}`, 'routes back to `new`');
  });
});

test('can cancel a transfer', function(assert) {
  setBreakpoint('greaterThanMobile');
  const {
    tickets,
    tickets: [{ orderId }],
    events: [event]
  } = createOrder(server, {
    ticketTraits: ['hasTransfer'],
    ticketConfig: { userId: this.user.id }
  });

  const { id: eventId } = event;
  const transfer = server.schema.ticketTransfers.find(1);

  visit(`/transfers/new/${orderId}/${eventId}`);

  andThen(() => {
    assert.equal($hook('tta_ticket_row').length, tickets.length, 'all tickets are rendered');
    assert.equal($hook('tta_ticket_row_transfer_status').length, tickets.length, 'and they show a status');
    assert.equal($hook('tta_ticket_row_checkbox').length, 0, 'but none have checkboxes');
    assert.equal($hook('tta_ticket_row_cancel').length, tickets.length, 'all have a cancel button');

    click($hook('tta_ticket_row_cancel').eq(0));
  });

  andThen(() => {
    assert.equal(currentURL(), `/transfers/new/${orderId}/${eventId}/m/cancel/${transfer.id}`, 'the cancel transfer screen is visible');

    // Go back first.
    click($hook('tta_cancel_confirmation_back_button'));
  });

  andThen(() => {
    assert.equal(currentURL(), `/transfers/new/${orderId}/${eventId}`, 'the transfer screen is visible again');
    click($hook('tta_ticket_row_cancel').eq(0));
  });

  andThen(() => {
    assert.equal(currentURL(), `/transfers/new/${orderId}/${eventId}/m/cancel/${transfer.id}`, 'the cancel transfer screen is visible');

    click($hook('tta_cancel_confirmation_confirm_button'));
  });

  andThen(() => {
    assert.equal(currentURL(), `/transfers/new/${orderId}/${eventId}`, 'the transfer screen is visible again');
    assert.equal($hook('tta_toast').text().trim(), 'Transfer cancelled.', 'there is a success toast');
    assert.equal($hook('tta_ticket_row_checkbox').length, 1, 'the ticket is able to be transferred again');

    const { first } = queryMetrics('trackEvent');

    assert.deepEqual(first, {
      event: 'cancelled transfer',
      numberOfTickets: tickets.length,
      transferId: transfer.id,
      eventName: event.name,
      eventId: event.id,
      orgId: event.organizationId,
      orgName: event.organizationName
    }, 'a cancellation event was tracked');
  });
});

test('canceling a transfer with an error shows a toast', function(assert) {
  setBreakpoint('greaterThanMobile');
  const {
    tickets,
    tickets: [{ orderId }],
    events: [event]
  } = createOrder(server, {
    ticketTraits: ['hasTransfer', 'errorsOnCancelTransfer'],
    ticketConfig: { userId: this.user.id }
  });

  const { id: eventId } = event;
  const transfer = server.schema.ticketTransfers.find(1);

  visit(`/transfers/new/${orderId}/${eventId}`);

  andThen(() => {
    assert.equal($hook('tta_ticket_row').length, tickets.length, 'all tickets are rendered');
    assert.equal($hook('tta_ticket_row_transfer_status').length, tickets.length, 'and they show a status');
    assert.equal($hook('tta_ticket_row_checkbox').length, 0, 'but none have checkboxes');
    assert.equal($hook('tta_ticket_row_cancel').length, tickets.length, 'all have a cancel button');

    click($hook('tta_ticket_row_cancel').eq(0));
  });

  andThen(() => {
    assert.equal(currentURL(), `/transfers/new/${orderId}/${eventId}/m/cancel/${transfer.id}`, 'the cancel transfer screen is visible');
    click($hook('tta_cancel_confirmation_confirm_button'));
  });

  andThen(() => {
    assert.equal(currentURL(), `/transfers/new/${orderId}/${eventId}`, 'the transfer screen is visible again');
    assert.equal($hook('tta_toast').text().trim(), 'We are unable to complete your request. Please try again later.', 'there is a success toast');

    const { first } = queryMetrics('trackEvent');

    assert.equal(first.event, 'error on cancel transfer', 'an error event was sent');
    assert.ok('error' in first, 'there is also an error message');

    assert.equal(first.eventId, event.id, 'event id is tracked');
    assert.equal(first.eventName, event.name, 'event name is tracked');
    assert.equal(first.orgId, event.organizationId, 'org id is tracked');
    assert.equal(first.orgName, event.organizationName, 'org name is tracked');
  });
});
