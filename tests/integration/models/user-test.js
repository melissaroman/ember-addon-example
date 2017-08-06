import get from 'ember-metal/get';
import { moduleForIntegration, test } from '../../helpers/module-for-integration';
import startMirage from '../../helpers/setup-mirage-for-integration';
import run from 'ember-runloop';

moduleForIntegration('Integration | Model | user', {
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

test('can fetch the current user', async function(assert) {
  const mirageUser = server.create('user', {
    _authToken: '1234-3456-5678'
  });

  const user = await this.store.queryRecord('user', { me: true });
  assert.deepEqual(get(user, 'id'), mirageUser.id);
});

test('can save the user firstName lastName', async function(assert) {
  server.create('user', {
    _authToken: '1234-3456-5678'
  });

  const user = await run(() => this.store.queryRecord('user', { me: true }));
  await run(() => {
    user.set('firstName', 'Spencer');
    user.set('lastName', 'Price');
    return user.save()
  });

  const [dbUser] = server.db.users.where({
    firstName: 'Spencer',
    lastName: 'Price'
  });

  assert.equal(dbUser.firstName, get(user, 'firstName'));
  assert.equal(dbUser.lastName, get(user, 'lastName'));
});
