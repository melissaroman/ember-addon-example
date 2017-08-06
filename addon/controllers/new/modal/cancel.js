import Controller from 'ember-controller';
import get from 'ember-metal/get';
import RSVP from 'rsvp';
import service from 'ember-service/inject';
import { task } from 'ember-concurrency';
import { translationMacro as t } from 'ember-i18n';
import { TOAST_ERROR_TIMEOUT, TOAST_SUCCESS_TIMEOUT } from '../../../utils/constants';
import getTransferTracking from '../../../utils/transfer-tracking-details';
import { assign } from 'ember-platform';

const { all } = RSVP;

export default Controller.extend({
  i18n: service(),
  metrics: service(),
  flashMessages: service(),

  cancelTransferError: t('transfer_request.cancel_error'),
  cancelTransferSuccess: t('transfer_request.cancel_success'),

  cancelTransfer: task(function *() {
    const transfer = get(this, 'model');
    const tickets = get(transfer, 'tickets').slice(0);
    const numberOfTickets = get(tickets, 'length');

    try {
      yield transfer.cancel().save();

      this.trackCancelTransfer(transfer, numberOfTickets);

      // Reload all the tickets to get the updated status.
      yield all(tickets.map((ticket) => {
        return ticket.reload();
      }));

      get(this, 'flashMessages').success(get(this, 'cancelTransferSuccess'), {
        timeout: TOAST_SUCCESS_TIMEOUT
      });
    } catch (e) {
      this.trackCancelError(e, transfer);

      get(this, 'flashMessages').danger(get(this, 'cancelTransferError'), {
        timeout: TOAST_ERROR_TIMEOUT
      });
    }
  }).restartable(),

  trackCancelTransfer(transfer, numberOfTickets) {
    const event = assign({
      transferId: get(transfer, 'id'),
      numberOfTickets,
      event: 'cancelled transfer'
    }, getTransferTracking(transfer));

    get(this, 'metrics').trackEvent(event);
  },

  trackCancelError(e, transfer) {
    const event = assign({
      event: 'error on cancel transfer',
      transferId: get(transfer, 'id'),
      error: e.toString()
    }, getTransferTracking(transfer));

    get(this, 'metrics').trackEvent(event);
  },

  actions: {
    cancelTransfer() {
      get(this, 'cancelTransfer').perform().then(() => {
        // TODO: Use replaceRoute when https://github.com/emberjs/ember.js/issues/15179 is resolved
        this.transitionToRoute('new').method('replace');
      });
    }
  }
});
