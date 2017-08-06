import { test } from 'ember-qunit';
import { moduleForComponent } from 'dummy/tests/helpers/test-module-for-engine';
import hbs from 'htmlbars-inline-precompile';
import { hook, initialize } from 'ember-hook';
import sinon from 'sinon';

moduleForComponent('tta-topbar/bar-action', 'Integration | Component | tta topbar/bar action', {
  integration: true,

  beforeEach() {
    initialize();
  }
});

test('it properly triggers the provided action', function(assert) {
  const action = sinon.stub();
  this.on('action', action);

  this.render(hbs`
    {{#tta-topbar/bar-action action=(action 'action')}}
      Return to Other Thing
    {{/tta-topbar/bar-action}}
  `);

  const $element = this.$(hook('tta_top_bar_action'));

  assert.equal($element.text().trim(), 'Return to Other Thing', 'the text is rendered');

  $element.click();

  assert.equal(action.callCount, 1, 'the action was triggered once');

  $element.find('a').click();

  assert.equal(action.callCount, 2, 'the action was triggered a second time');
});

test('it properly triggers the provided action, inline version', function(assert) {
  const action = sinon.stub();
  this.on('action', action);

  this.render(hbs`
    {{tta-topbar/bar-action "Return to Other Thing" action=(action 'action')}}
  `);

  const $element = this.$(hook('tta_top_bar_action'));

  assert.equal($element.text().trim(), 'Return to Other Thing');

  $element.click();

  assert.equal(action.callCount, 1, 'the action was triggered once');

  $element.find('a').click();

  assert.equal(action.callCount, 2, 'the action was triggered a second time');
});
