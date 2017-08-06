import { test } from 'ember-qunit';
import { moduleForComponent } from 'dummy/tests/helpers/test-module-for-engine';
import hbs from 'htmlbars-inline-precompile';
import { hook, initialize } from 'ember-hook';

moduleForComponent('tta-accept-completed-tickets', 'Integration | Component | tta accept completed tickets', {
  integration: true,
  beforeEach() {
    initialize();
  }
});

test('it handles the CANCELLED state', function(assert) {
  this.set('tickets', [
    { variantName: 'GA1' },
    { variantName: 'GA1' },
    { variantName: 'GA2' }
  ]);

  this.set('transfer', {
    sender: {
      firstName: 'Spencer'
    },
    status: 'CANCELLED'
  });

  this.render(hbs`{{tta-accept-completed-tickets tickets=tickets transfer=transfer}}`);

  assert.equal(this.$(hook('tta_accept_complete_ticket_row_variant_name')).eq(0).text().trim(), '2 x GA1');
  assert.equal(this.$(hook('tta_accept_complete_ticket_row_variant_name')).eq(1).text().trim(), '1 x GA2');

  assert.equal(this.$(hook('tta_accept_complete_ticket_row_sent_by')).eq(0).text().trim(), 'Sent by Spencer');
  assert.equal(this.$(hook('tta_accept_complete_ticket_row_status')).eq(0).text().trim(), 'Cancelled');

  this.set('transfer.sender', {
    email: 'spencer.price@ticketfly.com'
  });

  assert.equal(this.$(hook('tta_accept_complete_ticket_row_sent_by')).eq(0).text().trim(), 'Sent by spencer.price@ticketfly.com');

  this.set('transfer.status', 'DENIED');

  assert.equal(this.$(hook('tta_accept_complete_ticket_row_status')).eq(0).text().trim(), 'Declined');

  this.set('transfer.status', 'COMPLETED');

  assert.equal(this.$(hook('tta_accept_complete_ticket_row_status')).eq(0).text().trim(), 'Accepted');
});

test('it does not render a status with the PENDING state', function(assert) {
  this.set('tickets', [
    { variantName: 'GA1' },
    { variantName: 'GA1' },
    { variantName: 'GA2' }
  ]);

  this.set('transfer', {
    sender: {
      firstName: 'Spencer'
    },
    status: 'PENDING',
    isPending: true
  });

  this.render(hbs`{{tta-accept-completed-tickets tickets=tickets transfer=transfer}}`);

  assert.equal(this.$(hook('tta_accept_complete_ticket_row_variant_name')).eq(0).text().trim(), '2 x GA1');
  assert.equal(this.$(hook('tta_accept_complete_ticket_row_variant_name')).eq(1).text().trim(), '1 x GA2');

  assert.equal(this.$(hook('tta_accept_complete_ticket_row_sent_by')).eq(0).text().trim(), 'Sent by Spencer');
  assert.equal(this.$(hook('tta_accept_complete_ticket_row_status')).eq(0).text().trim(), '');
});
