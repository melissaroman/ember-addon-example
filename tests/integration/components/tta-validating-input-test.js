import { test } from 'ember-qunit';
import { moduleForComponent } from 'dummy/tests/helpers/test-module-for-engine';
import { hook, initialize as initHook } from 'ember-hook';
import { initialize as initKeyboard, triggerKeyUp } from 'ember-keyboard';
import sinon from 'sinon';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('tta-validating-input', 'Integration | Component | tta validating input', {
  integration: true,
  beforeEach() {
    initHook();
    initKeyboard();
  }
});

test('the on-update action works', function(assert) {
  assert.expect(3);

  this.set('action', sinon.stub());
  this.render(hbs`{{tta-validating-input on-update=(action action)}}`);

  assert.equal(this.$('input[type=text]').length, 1);

  this.$(hook('tta_validating_input')).val('Alexander');
  this.$(hook('tta_validating_input')).trigger('keyup');

  assert.equal(this.get('action').callCount, 1, 'action on triggered once');
  assert.ok(this.get('action').getCall(0).calledWithExactly('Alexander'));
});

test('it shows validation error only after each field is entered', function(assert) {
  this.set('isValid', false);
  this.render(hbs`{{tta-validating-input isValid=isValid error-message="Error!"}}`);

  assert.equal(this.$(hook('tta_validating_input', { invalid: true })).length, 0, 'name not marked invalid');
  assert.equal(this.$(hook('tta_validating_input_error')).text().trim(), '', 'error message not visible');

  this.$(hook('tta_validating_input')).trigger('blur');

  assert.equal(this.$(hook('tta_validating_input', { invalid: true })).length, 1, 'name marked invalid');
  assert.equal(this.$(hook('tta_validating_input_error')).text().trim(), 'Error!', 'error message visible');

  this.set('isValid', true);

  assert.equal(this.$(hook('tta_validating_input', { invalid: true })).length, 0, 'name not marked invalid');
});

test('immediately shows validation error if provided', function(assert) {
  this.set('isValid', false);
  this.render(hbs`{{tta-validating-input isValid=isValid error-message="Error!" validateImmediately=true}}`);

  assert.equal(this.$(hook('tta_validating_input', { invalid: true })).length, 1, 'name marked invalid');
  assert.equal(this.$(hook('tta_validating_input_error')).text().trim(), 'Error!', 'error message visible');

  this.set('isValid', true);

  assert.equal(this.$(hook('tta_validating_input', { invalid: true })).length, 0, 'name not marked invalid');
});

test('the `insert-newline` action is forwarded', function(assert) {
  this.set('isValid', false);
  this.set('action', sinon.stub());

  this.render(hbs`
    {{tta-validating-input
      insert-newline=(action action)
      isValid=isValid
      error-message="Error!"}}
  `);

  assert.equal(this.$(hook('tta_validating_input', { invalid: true })).length, 0, 'name not marked invalid');
  assert.equal(this.$(hook('tta_validating_input_error')).text().trim(), '', 'error message not visible');

  const input = hook('tta_validating_input');
  triggerKeyUp('Enter', input);

  assert.equal(this.$(hook('tta_validating_input', { invalid: true })).length, 1, 'name marked invalid');
  assert.equal(this.$(hook('tta_validating_input_error')).text().trim(), 'Error!', 'error message visible');
  assert.equal(this.get('action').callCount, 1, 'insert-newline action called');
});
