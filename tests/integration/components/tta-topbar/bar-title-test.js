import { test } from 'ember-qunit';
import { moduleForComponent } from 'dummy/tests/helpers/test-module-for-engine';
import hbs from 'htmlbars-inline-precompile';
import { hook, initialize } from 'ember-hook';

moduleForComponent('tta-topbar/bar-title', 'Integration | Component | tta topbar/bar title', {
  integration: true,

  beforeEach() {
    initialize();
  }
});

test('it yields the title', function(assert) {
  this.render(hbs`
    {{#tta-topbar/bar-title}}
      Title
    {{/tta-topbar/bar-title}}
  `);

  assert.equal(this.$(hook('tta_title')).text().trim(), 'Title');
});

test('it also supports an inline version', function(assert) {
  this.render(hbs`
    {{tta-topbar/bar-title 'Title'}}
  `);

  assert.equal(this.$(hook('tta_title')).text().trim(), 'Title');
});
