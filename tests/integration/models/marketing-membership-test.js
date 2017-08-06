import get from 'ember-metal/get';
import set from 'ember-metal/set';
import { moduleForIntegration, test } from '../../helpers/module-for-integration';
import startMirage from '../../helpers/setup-mirage-for-integration';
import run from 'ember-runloop';

moduleForIntegration('Integration | Model | marketing membership', {
  beforeEach() {
    this.store = this.container.lookup('service:store');

    this.register('service:session', {
      authorize(authorizer, block) {
        block('Authorization', `Bearer 1234-3456-5678`);
      }
    }, { instantiate: false });

    startMirage(this.container);
  },

  afterEach() {
    server.shutdown();
  }
});

test('can fetch and save a membership', async function(assert) {
  const mirageMembership = server.create('marketing-membership', {
    emailSubscription: false
  });

  const membershipArray = await this.store.query('marketing-membership', {
    userId: mirageMembership.userId,
    orgId: mirageMembership.orgId
  });
  const membership = get(membershipArray, 'firstObject');

  assert.deepEqual(get(membership, 'id'), mirageMembership.id);

  await run(() => {
    set(membership, 'emailSubscription', true);
    return membership.save();
  });

  assert.ok(server.db.marketingMemberships.find(mirageMembership.id).emailSubscription, 'membership was saved');
});

test('can create and save a membership', async function(assert) {
  const membership = await run(() => {
    return this.store.createRecord('marketing-membership', {
      orgId: '1234',
      userId: '1234',
      emailSubscription: false
    }).save();
  });

  const [dbMembership] = server.db.marketingMemberships.where({
    orgId: '1234',
    userId: '1234'
  });

  assert.equal(dbMembership.orgId, get(membership, 'orgId'));
  assert.equal(dbMembership.emailSubscription, get(membership, 'emailSubscription'));
});
