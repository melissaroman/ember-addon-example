import { test } from 'ember-qunit';
import { moduleForComponent } from 'dummy/tests/helpers/test-module-for-engine';
import hbs from 'htmlbars-inline-precompile';
import { hook, initialize } from 'ember-hook';

moduleForComponent('tta-confirmation-modal', 'Integration | Component | tta confirmation modal', {
  integration: true,
  beforeEach() {
    initialize();
  }
});

test('yields content', function(assert) {
  this.render(hbs`
    {{#tta-confirmation-modal}}
      Stuff.
    {{/tta-confirmation-modal}}
  `);

  assert.equal(this.$(hook('tta_confirmation_modal')).text().trim(), 'Stuff.', 'text is rendered');
});
