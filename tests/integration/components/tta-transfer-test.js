import { A } from 'ember-array/utils';
import { next } from 'ember-runloop';
import RSVP from 'rsvp';
import { test } from 'ember-qunit';
import { moduleForComponent } from 'dummy/tests/helpers/test-module-for-engine';
import hbs from 'htmlbars-inline-precompile';
import { hook, initialize as initializeHook } from 'ember-hook';
import sinon from 'sinon';

const { Promise } = RSVP;

moduleForComponent('tta-transfer', 'Integration | Component | tta transfer', {
  integration: true,

  beforeEach() {
    initializeHook();
  }
});

const tickets = A([
  {
    transferState: {
      transferable: true
    }
  },
  {
    transferState: {
      transferable: true
    }
  }
]);

test('the transfer button is only enabled if at least one ticket is selected, and a valid email is provided', function(assert) {
  assert.expect(6);

  this.set('tickets', tickets);

  this.render(hbs`{{tta-transfer tickets=tickets}}`);

  assert.ok(this.$(hook('tta_transfer_button')).attr('disabled'), 'disabled when no terms, no tickets, no email');

  assert.ok(this.$(hook('tta_transfer_button')).attr('disabled'), 'disabled when no tickets, no email');
  this.$(hook('tta_ticket_row')).first().click();

  assert.ok(this.$(hook('tta_transfer_button')).attr('disabled'), 'disabled when no email');
  this.$(hook('tta_validating_input')).val('foo').trigger('change');

  assert.ok(this.$(hook('tta_transfer_button')).attr('disabled'), 'disabled when invalid email');
  this.$(hook('tta_validating_input')).val('foo@bar.baz').trigger('change');

  assert.ok(!this.$(hook('tta_transfer_button')).attr('disabled'), 'enabled when terms, tickets, and valid email');
  this.$(hook('tta_ticket_row')).first().click();

  assert.ok(this.$(hook('tta_transfer_button')).attr('disabled'), 'disabled when no tickets');
});

test('a warning is provided if the tries to send tickets to themself', async function(assert) {
  this.set('tickets', tickets);
  this.set('user', {
    email: 'foo@bar.baz'
  })

  this.render(hbs`{{tta-transfer tickets=tickets user=user}}`);

  this.$(hook('tta_ticket_row')).first().click();

  const input = this.$(hook('tta_validating_input'));

  input.val('foo@bar.baz').trigger('change').trigger('blur');

  assert.ok(this.$(hook('tta_transfer_button')).attr('disabled'), 'transfer still disabled');
  assert.equal(this.$(hook('tta_validating_input_error')).length, 1, 'there is a validation error');

  input.val('foo2@bar.baz').trigger('change');

  assert.ok(!this.$(hook('tta_transfer_button')).attr('disabled'), 'transfer re-enabled after different email');
});

test('click the transfer button triggers the `submit-transfer` action', function(assert) {
  assert.expect(1);

  const stub = sinon.stub();

  this.on('transfer', stub);
  this.set('tickets', tickets);

  this.render(hbs`{{tta-transfer tickets=tickets submit-transfer=(action "transfer")}}`);

  this.$(hook('tta_transfer_terms')).find('input').click();
  this.$(hook('tta_ticket_row')).first().click();
  this.$(hook('tta_validating_input')).val('foo@bar.baz').trigger('change');

  this.$(hook('tta_transfer_button')).click();

  assert.equal(stub.callCount, 1, 'the action was called');
});

test('it is promise aware and shows loading states', function(assert) {
  let resolveTickets, resolveEvent;
  const done = assert.async();

  this.set('model', {
    tickets: new Promise((resolve) => resolveTickets = resolve),
    event: new Promise((resolve) => resolveEvent = resolve)
  });

  this.render(hbs`{{tta-transfer tickets=model.tickets event=model.event}}`);

  assert.ok(this.$(hook('tta_event_table', { isLoading: true })).length, 'the loading state is visible');

  resolveTickets(tickets);
  resolveEvent({});

  // Next Tick lets the concurrency task resolve
  next(() => {
    // And lets the animation complete.
    next(() => {
      assert.ok(this.$(hook('tta_event_table', { isLoading: false })).length, 'the loading state is gone');
      done();
    });
  });
});
