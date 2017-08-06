import { test } from 'ember-qunit';
import { moduleForComponent } from 'dummy/tests/helpers/test-module-for-engine';
import { hook, initialize as initializeHook } from 'ember-hook';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('tta-grouped-tickets', 'Integration | Component | tta grouped tickets', {
  integration: true,

  beforeEach() {
    initializeHook();
  }
});

test('it groups tickets', function(assert) {
  this.set('tickets', [
    { variantName: 'Test A', code: '12345' },
    { variantName: 'Test B', code: '23456' },
    { variantName: 'Test C', code: '34567' },
    { variantName: 'Test A', code: '45678' },
    { variantName: 'Test B', code: '56789' }
  ]);

  this.render(hbs`{{tta-grouped-tickets tickets=tickets}}`);

  const groups = this.$(hook('tta_grouped_tickets_grouping'));

  assert.equal(groups.length, 3, 'there are three groups');
  assert.equal(groups.eq(0).text().trim(), '2 x Test A');
  assert.equal(groups.eq(1).text().trim(), '2 x Test B');
  assert.equal(groups.eq(2).text().trim(), '1 x Test C');

  [
    ['Test A', 0, '*2345'],
    ['Test A', 1, '*5678'],
    ['Test B', 0, '*3456'],
    ['Test B', 1, '*6789'],
    ['Test C', 0, '*4567']
  ].forEach(([variantName, index, code], eachIndex) => {
    const element = this.$(hook('tta_grouped_tickets_ticket', { variantName, index }));
    assert.equal(element.text().trim(), `Barcode: ${code}`, `Ticket #${eachIndex} displays correct code`);
  });
});
