import { test } from 'ember-qunit';
import { moduleForComponent } from 'dummy/tests/helpers/test-module-for-engine';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';

const { $ } = Ember;

moduleForComponent('tta-block-body-scroll', 'Integration | Component | tta block body scroll', {
  integration: true
});

test('it renders', function(assert) {
  this.set('isVisible', true);
  this.render(hbs`
    {{#if isVisible}}
      {{tta-block-body-scroll}}
    {{/if}}
  `);

  assert.equal($('body').css('overflow'), 'hidden');

  this.set('isVisible', false);

  assert.equal($('body').css('overflow'), 'visible');
});
