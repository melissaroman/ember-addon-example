import { test } from 'ember-qunit';
import { moduleForComponent } from 'dummy/tests/helpers/test-module-for-engine';
import hbs from 'htmlbars-inline-precompile';
import { hook } from 'ember-hook';

moduleForComponent('tta-transfer-error', 'Integration | Component | tta transfer error', {
  integration: true
});

test('it renders the icon and text', function(assert) {
  this.render(hbs`{{tta-transfer-error}}`);

  assert.ok(this.$(hook('tta_transfer_error_icon')).length, 'there is an icon');
  assert.equal(this.$(hook('tta_transfer_error_text')).text().trim(), 'No transferable tickets found.');
});
