import Route from 'ember-route';
import service from 'ember-service/inject';
import get from 'ember-metal/get';
import { translationMacro as t } from 'ember-i18n';
import { TOAST_ERROR_TIMEOUT } from '../../../utils/constants';

export default Route.extend({
  i18n: service(),
  flashMessages: service(),
  store: service(),

  noTransferError: t('transfer_request.cancel_error'),

  model({ transferId }) {
    return get(this, 'store').peekRecord('ticket-transfer', transferId);
  },

  setupController(controller, transfer) {
    this._super(controller, transfer);

    if (!transfer) {
      this.replaceWith('new');
      get(this, 'flashMessages').danger(get(this, 'noTransferError'), {
        timeout: TOAST_ERROR_TIMEOUT
      });
    }
  }
});
