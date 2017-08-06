import { test } from 'ember-qunit';
import { moduleForComponent } from 'dummy/tests/helpers/test-module-for-engine';
import hbs from 'htmlbars-inline-precompile';
import { hook, initialize } from 'ember-hook';
import sinon from 'sinon';

moduleForComponent('tta-topbar', 'Integration | Component | tta topbar', {
  integration: true,

  beforeEach() {
    initialize();
  }
});

test('it yields title and action components', function(assert) {
  const action = sinon.stub();
  this.on('action', action);

  this.render(hbs`
    {{#tta-topbar as |bar|}}
      {{#bar.title}}foo{{/bar.title}}
      {{#bar.action action=(action 'action')}}
        bar
      {{/bar.action}}
    {{/tta-topbar}}
  `);

  const $actionElement = this.$(hook('tta_top_bar_action'));

  assert.equal(this.$(hook('tta_title')).text().trim(), 'foo', 'yields content into top bar title');
  assert.equal($actionElement.text().trim(), 'bar', 'yields content into action component');

  $actionElement.click();

  assert.equal(action.callCount, 1, 'the action was triggered once');
});


test('it yields title and action components, inline style', function(assert) {
  const action = sinon.stub();
  this.on('action', action);

  this.render(hbs`
    {{#tta-topbar as |bar|}}
      {{bar.title "foo"}}
      {{bar.action "bar" action=(action 'action')}}
    {{/tta-topbar}}
  `);

  const $actionElement = this.$(hook('tta_top_bar_action'));

  assert.equal(this.$(hook('tta_title')).text().trim(), 'foo', 'yields content into top bar title');
  assert.equal($actionElement.text().trim(), 'bar', 'yields content into action component');

  $actionElement.click();

  assert.equal(action.callCount, 1, 'the action was triggered once');
});
