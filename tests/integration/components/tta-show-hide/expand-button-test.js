import { test } from 'ember-qunit';
import { moduleForComponent } from 'dummy/tests/helpers/test-module-for-engine';
import sinon from 'sinon';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('tta-show-hide/expand-button', 'Integration | Component | tta show hide/expand button', {
  integration: true
});

test('necessary aria roles are added to button element', function(assert) {
  this.set('toggled', false);

  this.render(hbs`
    {{#tta-show-hide/expand-button toggled=toggled aria-controls='test-id'}}
      Text
    {{/tta-show-hide/expand-button}}
  `);

  assert.equal(this.$('button').text().trim(), 'Text', 'button content is yielded');

  assert.equal(this.$('button').attr('aria-controls'), 'test-id', 'button has `aria-controls` attribute');
  assert.equal(this.$('button').attr('aria-expanded'), 'false', 'button has `aria-expanded` attribute');

  this.set('toggled', true);

  assert.equal(this.$('button').attr('aria-expanded'), 'true', '`aria-expanded` attribute updates based on state');
});

test('icon class changes based on `toggled` state', function(assert) {
  this.set('toggled', false);

  this.render(hbs`
    {{#tta-show-hide/expand-button toggled=toggled}}
      Text
    {{/tta-show-hide/expand-button}}
  `);

  assert.equal(this.$('.tf-direct-right').length, 1, 'icon pointing right is visible');

  this.set('toggled', true);

  assert.equal(this.$('.tf-direct-down').length, 1, 'icon pointing down is visible');
});

test('click actions work by clicking on the button element', function(assert) {
  const stub = sinon.stub();

  this.on('toggle', stub);

  this.render(hbs`
    {{#tta-show-hide/expand-button toggle=(action 'toggle')}}
      Text
    {{/tta-show-hide/expand-button}}
  `);

  this.$('button').click();

  assert.equal(stub.callCount, 1, 'action triggered');
});

test('click actions work by clicking on the containing element', function(assert) {
  const stub = sinon.stub();

  this.on('toggle', stub);

  this.render(hbs`
    {{#tta-show-hide/expand-button class="click-me" toggle=(action 'toggle')}}
      Text
    {{/tta-show-hide/expand-button}}
  `);

  this.$('.click-me').click();

  assert.equal(stub.callCount, 1, 'action triggered');
});
