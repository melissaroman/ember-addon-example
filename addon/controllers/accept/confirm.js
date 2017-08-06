import Controller from 'ember-controller';
import service from 'ember-service/inject';
import get, { getProperties } from 'ember-metal/get';
import computed, { alias } from 'ember-computed';
import { translationMacro as t } from 'ember-i18n';
import { task } from 'ember-concurrency';
import { TOAST_ERROR_TIMEOUT } from '../../utils/constants';
import getTransferTracking from '../../utils/transfer-tracking-details';
import { assign } from 'ember-platform';

export default Controller.extend({
  i18n: service(),
  metrics: service(),
  flashMessages: service(),
  marketingPref: alias('resolvedModel.marketingPreference'),
  user: alias('resolvedModel.user'),
  transfer: alias('resolvedModel.transfer'),
  isAcceptingTransfer: alias('acceptTransfer.isRunning'),
  isAcceptingToSameUser: computed('user.email', 'transfer.sender.email', {
    get() {
      // Only do the check if user and transfer are resolved.
      return get(this, 'user') &&
        get(this, 'transfer') &&
        get(this, 'user.email') === get(this, 'transfer.sender.email');
    }
  }),

  acceptButtonDisabled: computed('isAcceptingTransfer', 'userNamesAreValid', 'isAcceptingToSameUser', {
    get() {
      return get(this, 'isAcceptingToSameUser') || !get(this, 'userNamesAreValid') || get(this, 'isAcceptingTransfer');
    }
  }),

  // It is intentional that we do not depend on firstName/lastName as we only
  // want this to become true/false when the model initially changes.
  shouldDisplayUserNames: computed('user', {
    get() {
      const user = get(this, 'user');

      if (!user) {
        return false;
      }

      const { firstName, lastName } = getProperties(user, 'firstName', 'lastName');

      return !(firstName && lastName);
    }
  }).readOnly(),

  transferErrorMessage: t('accept_transfer.accept_error'),

  numberToAccept: alias('resolvedModel.tickets.length'),

  acceptTransfer: task(function * () {
    const transfer = get(this, 'resolvedModel.transfer');
    const acceptanceToken = get(this, 'resolvedModel.acceptanceToken');
    const marketingPrefStatus = this.getMarketingPrefStatus();

    try {
      yield this.updateMarketingPreference();
      const didUpdateUser = yield this.updateUserInformation();
      yield transfer.accept(acceptanceToken).save();
      this.send('acceptSucceeded');
      this.sendAcceptMetrics(transfer, marketingPrefStatus, didUpdateUser);
    } catch (e) {
      transfer.rollbackAttributes();
      this.sendAcceptErrorMetrics(e, transfer);
      get(this, 'flashMessages').danger(get(this, 'transferErrorMessage'), {
        timeout: TOAST_ERROR_TIMEOUT
      });
    }
  }).drop(),

  getMarketingPrefStatus() {
    const pref = get(this, 'marketingPref');
    const marketingPreferenceOptIn = get(pref, 'emailSubscription');
    const changedMarketingPreference = get(pref, 'isNew') ? false : get(pref, 'hasDirtyAttributes');

    return { marketingPreferenceOptIn, changedMarketingPreference };
  },

  updateMarketingPreference() {
    const pref = get(this, 'marketingPref');
    if (get(pref, 'hasDirtyAttributes') || get(pref, 'isNew')) {
      return pref.save();
    }
  },

  updateUserInformation() {
    const user = get(this, 'user');

    // Wether there were changes to the user is a proxy for wether
    // this is a "new" user.
    if (user && get(user, 'hasDirtyAttributes')) {
      return user.save().then(() => {
        user.identifyUserForMetrics();
        return true;
      });
    } else {
      return false;
    }
  },

  sendAcceptMetrics(transfer, { marketingPreferenceOptIn, changedMarketingPreference }, didUpdateUser) {
    const event = assign({
      marketingPreferenceOptIn,
      changedMarketingPreference,
      newOptInToOrg: marketingPreferenceOptIn && changedMarketingPreference,
      isProbablyNewUser: didUpdateUser,
      event: 'transfer acceptance',
      transferId: get(transfer, 'id'),
      numberOfTicketsAccepted: get(transfer, 'tickets.length')
    }, getTransferTracking(transfer));

    get(this, 'metrics').trackEvent(event);
  },

  sendAcceptErrorMetrics(e, transfer) {
    const event = assign({
      event: 'error on transfer acceptance',
      error: e.toString()
    }, getTransferTracking(transfer));

    get(this, 'metrics').trackEvent(event);
  },

  userNamesAreValid: computed('user.{firstName,lastName}', {
    get() {
      return get(this, 'user.firstName') && get(this, 'user.lastName');
    }
  }),

  actions: {
    toggleAgreedToPromotions() {
      this.toggleProperty('marketingPref.emailSubscription');
    },

    acceptTransfer() {
      if (get(this, 'userNamesAreValid')) {
        get(this, 'acceptTransfer').perform();
      }
    }
  }
});
