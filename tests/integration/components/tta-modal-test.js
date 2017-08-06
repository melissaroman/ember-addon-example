import { test } from 'ember-qunit';
import { moduleForComponent } from 'dummy/tests/helpers/test-module-for-engine';
import hbs from 'htmlbars-inline-precompile';
import { initialize, triggerKeyPress } from 'ember-keyboard';
import sinon from 'sinon';

moduleForComponent('tta-modal', 'Integration | Component | tta modal', {
  integration: true,

  beforeEach() {
    initialize();
  }
});

test('it triggers action on escape key', async function(assert) {
  const callback = sinon.stub();

  this.on('action', callback);

  this.render(hbs`
    {{#tta-modal on-close=(action "action")}}
      template block text
    {{/tta-modal}}
  `);

  await triggerKeyPress('Escape');

  assert.equal(callback.callCount, 1, 'the `on-close` action was called');
});
