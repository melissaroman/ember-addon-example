import { test } from 'ember-qunit';
import { moduleForComponent } from 'dummy/tests/helpers/test-module-for-engine';
import hbs from 'htmlbars-inline-precompile';
import { hook, initialize as initializeHook } from 'ember-hook';
import sinon from 'sinon';

moduleForComponent('tta-modal', 'Integration | Component | tta same user modal', {
  integration: true,

  beforeEach() {
    initializeHook();
  }
});

test('the email address is rendered', function(assert) {
  this.register('service:session', {}, { instantiate: false });
  this.render(hbs`{{tta-same-user-modal email="spencer.price@ticketfly.com"}}`);

  assert.equal(this.$(hook('same_user_modal_email')).text().trim(), 'spencer.price@ticketfly.com');
});

test('the switch accounts button calls the invalidate session method', function(assert) {
  const invalidate = sinon.stub();

  this.register('service:session', { invalidate }, { instantiate: false });

  this.render(hbs`{{tta-same-user-modal}}`);

  const button = this.$(hook('same_user_modal_switch_accounts'));

  button.click();

  assert.ok(button.attr('disabled'), 'the button is disabled');
  assert.equal(invalidate.callCount, 1);
});
