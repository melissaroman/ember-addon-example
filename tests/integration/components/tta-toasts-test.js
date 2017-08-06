import getOwner from 'ember-owner/get';
import { test } from 'ember-qunit';
import { moduleForComponent } from 'dummy/tests/helpers/test-module-for-engine';
import { hook, initialize as initializeHook } from 'ember-hook';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('tta-toasts', 'Integration | Component | tta toasts', {
  integration: true,
  beforeEach() {
    initializeHook();
    const typesUsed = ['danger'];
    this.flashMessages = getOwner(this).lookup('service:flash-messages');
    this.flashMessages.registerTypes(typesUsed);
  }
});

test('it renders', function(assert) {
  this.render(hbs`{{tta-toasts}}`);

  assert.equal(this.$(hook('tta_toast')).length, 0, 'there are no toasts yet');
});
