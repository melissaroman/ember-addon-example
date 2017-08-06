import Ember from 'ember';
import Controller from 'ember-controller';
import { task, timeout } from 'ember-concurrency';
import get from 'ember-metal/get';
import service from 'ember-service/inject';
import { translationMacro as t } from 'ember-i18n';
import RSVP from 'rsvp';
import { CIRCLE_MASK_DURATION, TOAST_ERROR_TIMEOUT } from '../../../utils/constants';
import getTransferTracking from '../../../utils/transfer-tracking-details';
import { assign } from 'ember-platform';

const { testing } = Ember;
const { all } = RSVP;

export default Controller.extend({
  store: service(),
  i18n: service(),
  metrics: service(),
  flashMessages: service(),
  pendingTransferCreation: false,

  transferErrorMessage: t('transfer_request.send_error'),

  createTransfer: task(function * () {
    const { tickets, email, message } = get(this, 'model');
    this.send('showLoading');

    const newTransfer = get(this, 'store').createRecord('ticket-transfer', {
      tickets,
      message,
      recipient: { email }
    });

    const savingTransfer = newTransfer.save();

    // No matter what, let the animation complete.
    if (!testing) {
      yield timeout(CIRCLE_MASK_DURATION + 200);
    }

    try {
      // Additionally pause for the transfer.
      const transfer = yield savingTransfer;

      // Track the created transfer
      this.trackTransferCreate(transfer);

      // Then, reload all of the tickets that were transferred.
      yield all(tickets.map((ticket) => ticket.reload()));

      // TODO: Use replaceRoute when https://github.com/emberjs/ember.js/issues/15179 is resolved
      this.transitionToRoute('new.modal.success').method('replace');
    } catch(e) {
      this.trackTransferError(e, newTransfer);

      // TODO: Use replaceRoute when https://github.com/emberjs/ember.js/issues/15179 is resolved
      this.transitionToRoute('new.modal.confirm').method('replace');

      get(this, 'flashMessages').danger(get(this, 'transferErrorMessage'), {
        timeout: TOAST_ERROR_TIMEOUT
      });
    }
  }).restartable(),

  trackTransferCreate(transfer) {
    const event = assign({
      event: 'created transfer',
      transferId: get(transfer, 'id'),
      numberOfTickets: get(transfer, 'tickets.length')
    }, getTransferTracking(transfer));

    get(this, 'metrics').trackEvent(event);
  },

  trackTransferError(e, transfer) {
    const event = assign({
      event: 'error on create transfer',
      error: e.toString()
    }, getTransferTracking(transfer));

    get(this, 'metrics').trackEvent(event);
  },

  actions: {
    createTransfer() {
      return get(this, 'createTransfer').perform();
    }
  }
});
