import sinon from 'sinon';
import { test } from 'ember-qunit';
import { moduleForComponent } from 'dummy/tests/helpers/test-module-for-engine';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('tta-selected-list', 'Integration | Component | tta selected list', {
  integration: true
});

test('`tta-selected-list` yields a list of selected and not selected items', function(assert) {
  const stub = sinon.stub();
  this.on('selectionChanged', stub);

  this.set('list', [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' }
  ]);

  this.render(hbs`
    {{#tta-selected-list list=list selection-changed=(action 'selectionChanged') as |ctx|}}
      {{#each ctx.selected as |sel|~}}
        <span class="selected" {{action ctx.toggle sel}}>{{~sel.id~}}</span>
      {{~/each}}
      {{#each ctx.not-selected as |sel|~}}
        <span class="not-selected" {{action ctx.toggle sel}}>{{~sel.id~}}</span>
      {{~/each}}
    {{/tta-selected-list}}
  `);

  assert.equal(this.$('.not-selected').text().trim(), '1234');
  assert.equal(this.$('.selected').text().trim(), '');

  this.$('.not-selected:eq(0)').click();

  assert.deepEqual(stub.getCall(0).args[0], [{ id: '1' }], 'the action was triggered correctly');

  this.$('.not-selected:eq(0)').click();

  assert.deepEqual(stub.getCall(1).args[0], [{ id: '1' }, { id: '2' }], 'the action was triggered correctly');

  assert.equal(this.$('.not-selected').text().trim(), '34');
  assert.equal(this.$('.selected').text().trim(), '12');

  this.$('.selected:eq(0)').click();

  assert.deepEqual(stub.getCall(2).args[0], [{ id: '2' }], 'the action was triggered correctly');

  assert.equal(this.$('.not-selected').text().trim(), '134');
  assert.equal(this.$('.selected').text().trim(), '2');
});

test('`tta-selected-list` yields a list of all items, with a helper for determining toggle', function(assert) {
  const stub = sinon.stub();
  const list = [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' }
  ];

  this.on('selectionChanged', stub);

  this.set('list', list);

  this.render(hbs`
    {{#tta-selected-list list=list selection-changed=(action 'selectionChanged') as |ctx|}}
      {{#each ctx.all-items as |sel|~}}
        <span class={{if (contains sel ctx.selected) "selected" "not-selected"}} {{action ctx.toggle sel}}>
          {{~sel.id~}}
        </span>
      {{~/each}}
    {{/tta-selected-list}}
  `);

  assert.equal(this.$('.not-selected').text().trim(), '1234');
  assert.equal(this.$('.selected').text().trim(), '');

  this.$('.not-selected:eq(0)').click();

  assert.deepEqual(stub.getCall(0).args[0], [list[0]], 'the action was triggered correctly');
  assert.equal(this.$('.not-selected').text().trim(), '234');

  this.$('.not-selected:eq(0)').click();

  assert.deepEqual(stub.getCall(1).args[0], [list[0], list[1]], 'the action was triggered correctly');

  assert.equal(this.$('.not-selected').text().trim(), '34');
  assert.equal(this.$('.selected').text().trim(), '12');

  this.$('.selected:eq(0)').click();

  assert.deepEqual(stub.getCall(2).args[0], [list[1]], 'the action was triggered correctly');

  assert.equal(this.$('.not-selected').text().trim(), '134');
  assert.equal(this.$('.selected').text().trim(), '2');
});

test('`tta-selected-list` resets when a new list is provided', function(assert) {
  this.set('list', [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' }
  ]);

  this.render(hbs`
    {{#tta-selected-list list=list as |ctx|}}
      {{#each ctx.selected as |sel|~}}
        <span class="selected" {{action ctx.toggle sel}}>{{~sel.id~}}</span>
      {{~/each}}
      {{#each ctx.not-selected as |sel|~}}
        <span class="not-selected" {{action ctx.toggle sel}}>{{~sel.id~}}</span>
      {{~/each}}
    {{/tta-selected-list}}
  `);

  assert.equal(this.$('.not-selected').text().trim(), '1234');

  this.$('.not-selected:eq(0)').click();

  assert.equal(this.$('.not-selected').text().trim(), '234');

  this.set('list', [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' }
  ]);

  assert.equal(this.$('.not-selected').text().trim(), '12345');
});

test('`tta-selected-list` accepts a list of already-selected items', function(assert) {
  const item1 = { id: '1' };
  const item2 = { id: '2' };

  this.set('selected', [item1]);
  this.set('list', [
    item1,
    item2,
    { id: '3' },
    { id: '4' }
  ]);

  this.render(hbs`
    {{#tta-selected-list selected=selected list=list as |ctx|}}
      {{#each ctx.selected as |sel|~}}
        <span class="selected" {{action ctx.toggle sel}}>{{~sel.id~}}</span>
      {{~/each}}
      {{#each ctx.not-selected as |sel|~}}
        <span class="not-selected" {{action ctx.toggle sel}}>{{~sel.id~}}</span>
      {{~/each}}
    {{/tta-selected-list}}
  `);

  assert.equal(this.$('.not-selected').text().trim(), '234');
  assert.equal(this.$('.selected').text().trim(), '1');

  this.set('selected', [item2]);

  assert.equal(this.$('.not-selected').text().trim(), '134');
  assert.equal(this.$('.selected').text().trim(), '2');
});

test('`tta-selected-list` does not render any elements', function(assert) {
  this.render(hbs`{{tta-selected-list}}`);
  assert.equal(this.$('*').length, 0);
});

test('`tta-selected-list` does not allow mutations on action result to affect component', function(assert) {
  this.set('list', [{ id: '1' }]);
  this.on('selectionChanged', (list) => list.clear());

  this.render(hbs`
    {{#tta-selected-list list=list selection-changed=(action 'selectionChanged') as |ctx|}}
      {{#each ctx.not-selected as |sel|~}}
        <span class="item" {{action ctx.toggle sel}}>{{~sel.id~}}</span>
      {{~/each}}
    {{/tta-selected-list}}
  `);

  assert.equal(this.$('.item').text().trim(), '1');

  this.$('.item').eq(0).click();

  assert.equal(this.$('.item').text().trim(), '');
});
