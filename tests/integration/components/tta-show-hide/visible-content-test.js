import { test } from 'ember-qunit';
import { moduleForComponent } from 'dummy/tests/helpers/test-module-for-engine';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('tta-show-hide/visible-content', 'Integration | Component | tta show hide/visible content', {
  integration: true
});

test('it shows or hides content based on visible attribute', function(assert) {
  this.set('visible', false);

  this.render(hbs`
    {{#tta-show-hide/visible-content visible=visible}}
      Visible
    {{/tta-show-hide/visible-content}}
  `);

  assert.equal(this.$().text().trim(), '');

  this.set('visible', true);

  assert.equal(this.$().text().trim(), 'Visible');
});
