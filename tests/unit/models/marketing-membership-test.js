import { moduleForModel, test } from 'ember-qunit';

moduleForModel('marketing-membership', 'Unit | Model |  marketing membership', {});

test('it exists', function(assert) {
  const MarketingMembership = this.store().modelFor('marketing-membership');
  assert.ok(MarketingMembership);
});
