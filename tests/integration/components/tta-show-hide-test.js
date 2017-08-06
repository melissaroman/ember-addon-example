import { test } from 'ember-qunit';
import { moduleForComponent } from 'dummy/tests/helpers/test-module-for-engine';
import { hook } from 'ember-hook';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('tta-show-hide', 'Integration | Component | tta show hide', {
  integration: true
});

test('it renders closed by default', function(assert) {
  this.render(hbs`
    {{#tta-show-hide as |ctx|}}
      <button {{action ctx.toggle}}>Toggle!</button>
      {{#ctx.content}}
        <span class="content">Visible!</span>
      {{/ctx.content}}

      {{#if ctx.toggled}}
        <span class="if-toggled">Toggled!</span>
      {{/if}}
    {{/tta-show-hide}}
  `);

  assert.equal(this.$('.content').length, 0, 'the content is hidden');
  assert.equal(this.$('.if-toggled').length, 0, 'the content is hidden');

  this.$('button').click();

  assert.equal(this.$('.content').length, 1, 'the content is visible');
  assert.equal(this.$('.if-toggled').length, 1, 'the content is visible');

  this.$('button').click();

  assert.equal(this.$('.content').length, 0, 'the content is hidden');
  assert.equal(this.$('.if-toggled').length, 0, 'the content is hidden');
});

test('the `button` and `content` components have the right aria settings', function(assert) {
  this.render(hbs`
    {{#tta-show-hide as |ctx|}}
      {{#ctx.button}}
        Button
      {{/ctx.button}}

      {{#ctx.content class="content"}}
        Content
      {{/ctx.content}}
    {{/tta-show-hide}}
  `);

  const controlsId = this.$(hook('tta_show_hide_button')).attr('aria-controls');

  assert.ok(controlsId, 'the expand button has an aria controls attribute set');
  assert.ok(this.$(`#${controlsId}`).hasClass('content'), 'the id is of the content');
});
