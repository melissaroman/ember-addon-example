import { test } from 'ember-qunit';
import { moduleFor } from 'dummy/tests/helpers/test-module-for-engine';
import get from 'ember-metal/get';
import set from 'ember-metal/set';

moduleFor('controller:accept/confirm', 'Unit | Controller | accept/confirm', {
  needs: ['service:i18n', 'service:flashMessages'],
  beforeEach() {
    this.register('service:metrics', {}, { instantiate: false });
  }
});

test('it can toggle `agreedToPromotions`', function(assert) {
  const controller = this.subject({
    resolvedModel: {
      marketingPreference: {
        emailSubscription: false
      }
    }
  });

  controller.send('toggleAgreedToPromotions');

  assert.equal(get(controller, 'marketingPref.emailSubscription'), true);

  controller.send('toggleAgreedToPromotions');

  assert.equal(get(controller, 'marketingPref.emailSubscription'), false);
});

test('the `acceptButtonDisabled` accomodates missing names', function(assert) {
  const controller = this.subject({
    acceptTransfer: {
      isRunning: false
    },
    resolvedModel: {
      user: {
        firstName: 'Spencer',
        lastName: '',
        email: 'spencer.price@ticketfly.com'
      }
    }
  });

  assert.ok(get(controller, 'acceptButtonDisabled'), 'disabled due to missing last name');

  set(controller, 'user.lastName', 'Price');

  assert.ok(!get(controller, 'acceptButtonDisabled'), 'no longer disabled');

  set(controller, 'acceptTransfer.isRunning', true);

  assert.ok(get(controller, 'acceptButtonDisabled'), 'disabled due to flag');
});

test('the `acceptButtonDisabled` accomodates attempt to accept into same account', function(assert) {
  const controller = this.subject({
    acceptTransfer: {
      isRunning: false
    },
    resolvedModel: {
      user: {
        firstName: 'Spencer',
        lastName: 'Price',
        email: 'spencer.price@ticketfly.com'
      },
      transfer: {
        sender: { email: 'spencer.price@ticketfly.com' }
      }
    }
  });

  assert.ok(get(controller, 'acceptButtonDisabled'), 'disabled due to same user as sender');

  set(controller, 'user.email', 'spencer1234@ticketfly.com');

  assert.ok(!get(controller, 'acceptButtonDisabled'), 'no longer disabled');
});

test('`shouldDisplayUserNames` uses the original value of keys and ignores updates', function(assert) {
  const controller = this.subject({
    resolvedModel: {
      user: {
        firstName: 'Spencer',
        lastName: ''
      }
    }
  });

  assert.ok(get(controller, 'shouldDisplayUserNames'), 'initially is true');

  set(controller, 'user.lastName', 'Price');

  assert.ok(get(controller, 'shouldDisplayUserNames'), 'remains true');
});
