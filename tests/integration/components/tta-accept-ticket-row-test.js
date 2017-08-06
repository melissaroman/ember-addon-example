import { test } from 'ember-qunit';
import { moduleForComponent } from 'dummy/tests/helpers/test-module-for-engine';
import hbs from 'htmlbars-inline-precompile';
import { hook } from 'ember-hook';

moduleForComponent('tta-accept-ticket-row', 'Integration | Component | tta accept ticket row', {
  integration: true
});

test('it displays the variant description', function(assert) {
  assert.expect(1);

  this.set('ticket', { variantName: 'foo' });

  this.render(hbs`{{tta-accept-ticket-row ticket=ticket}}`);

  assert.equal(this.$(hook('tta_accept_ticket_row_variant_description')).text().trim(), 'foo');
});

test('it displays the index and ticketsLength', function(assert) {
  assert.expect(1);

  this.render(hbs`{{tta-accept-ticket-row index=2 ticketsLength=5}}`);

  assert.equal(this.$(hook('tta_accept_ticket_row_count_info')).text().trim(), '3 of 5');
});

test('it seat info if present', function(assert) {
  assert.expect(1);

  this.set('ticket', { properties: { section: 'C', seat: '12' } });

  this.render(hbs`{{tta-accept-ticket-row index=2 ticketsLength=5 ticket=ticket}}`);

  assert.equal(this.$(hook('tta_accept_ticket_row_count_info')).text().trim(), 'Section C · Seat 12');
});
