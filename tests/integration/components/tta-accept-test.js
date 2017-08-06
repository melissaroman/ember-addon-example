import { test } from 'ember-qunit';
import { moduleForComponent } from 'dummy/tests/helpers/test-module-for-engine';
import hbs from 'htmlbars-inline-precompile';
import { hook, initialize as initializeHook } from 'ember-hook';

moduleForComponent('tta-accept', 'Integration | Component | tta accept', {
  integration: true,

  beforeEach() {
    initializeHook();
  }
});

test('the tickets are rendered with numbers according to the variantName', function(assert) {
  this.set('event', {});
  this.set('tickets', [{ variantName: 'a' }, { variantName: 'a' }, { variantName: 'b' }]);

  this.render(hbs`{{tta-accept event=event tickets=tickets}}`);

  assert.equal(this.$(hook('tta_accept_ticket_row')).length, 3, 'there are three accepted tickets');
  assert.equal(this.$(hook('tta_accept_ticket_row_count_info')).eq(0).text().trim(), '1 of 2');
  assert.equal(this.$(hook('tta_accept_ticket_row_count_info')).eq(1).text().trim(), '2 of 2');
  assert.equal(this.$(hook('tta_accept_ticket_row_count_info')).eq(2).text().trim(), '1 of 1');
});
