import { test } from 'ember-qunit';
import { moduleForComponent } from 'dummy/tests/helpers/test-module-for-engine';
import hbs from 'htmlbars-inline-precompile';
import { hook, initialize as initializeHook } from 'ember-hook';
import sinon from 'sinon';

moduleForComponent('tta-personal-message', 'Integration | Component | tta personal message', {
  integration: true,

  beforeEach() {
    initializeHook();
  }
});

test('it can add a personal message', function(assert) {
  this.set('message', '');

  this.on('updateMessage', (message) => {
    this.set('message', message);
  });

  this.render(hbs`{{tta-personal-message action=(action 'updateMessage')}}`);

  this.$(hook('tta_personal_message_add')).click();

  this.$(hook('tta_personal_message_input')).val('Test 1234').trigger('keyup');

  assert.equal(this.get('message'), 'Test 1234', 'the message was updated');

  this.$(hook('tta_personal_message_clear')).click();

  assert.equal(this.get('message'), '', 'the message was cleared');
});

test('the personal message can be edited', function(assert) {
  this.set('message', '');

  this.on('updateMessage', (message) => {
    this.set('message', message);
  });

  this.render(hbs`{{tta-personal-message action=(action 'updateMessage')}}`);

  this.$(hook('tta_personal_message_add')).click();

  this.$(hook('tta_personal_message_input')).val('Hello????').trigger('keyup');

  assert.equal(this.get('message'), 'Hello????', 'the message was updated');

  this.$(hook('tta_personal_message_input')).val('Howdy!').trigger('keyup');

  assert.equal(this.get('message'), 'Howdy!', 'the message was updated');
});

test('the personal message is constrained to 1,000 characters', function(assert) {
  const str = makeStringOfLength(2000);
  const stub = sinon.stub();

  this.on('updateMessage', stub);

  this.render(hbs`{{tta-personal-message action=(action 'updateMessage')}}`);

  this.$(hook('tta_personal_message_add')).click();

  assert.equal(this.$('textarea').attr('maxlength'), '1000', 'the textarea has a max length attribute');

  this.$(hook('tta_personal_message_input')).val(str).trigger('keyup');

  const { args: [calledString] } = stub.getCall(1);
  assert.equal(calledString.length, 1000, 'string was capped at 1000 characters');
});

function makeStringOfLength(length) {
  return Array(length).join('a');
}
