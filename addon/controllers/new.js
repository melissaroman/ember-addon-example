import Controller from 'ember-controller';
import service from 'ember-service/inject';
import get from 'ember-metal/get';
import set from 'ember-metal/set';
import computed from 'ember-computed';
import { A } from 'ember-array/utils';
import { translationMacro as t } from 'ember-i18n';
import { TOAST_ERROR_TIMEOUT } from '../utils/constants';

export default Controller.extend({
  i18n: service(),
  transfers: service(),
  flashMessages: service(),

  error: null,
  transferToEmail: '',
  transferMessage: '',
  selectedTickets: null,

  errorMessage: t('transfer_request.load_error_toast'),

  headerTranslationKey: computed('media.isMobile', {
    get() {
      return `topbar.back_to_orders${get(this, 'media.isMobile') ? '_mobile' : ''}`;
    }
  }),

  init() {
    this._super(...arguments);
    this.resetState();
  },

  resetState() {
    set(this, 'transferToEmail', '');
    set(this, 'transferMessage', '');
    set(this, 'selectedTickets', A());
    set(this, 'error', null);
  },

  routeDidError(error) {
    set(this, 'error', error);
    get(this, 'flashMessages').danger(get(this, 'errorMessage'), {
      timeout: TOAST_ERROR_TIMEOUT
    });
  },

  actions: {
    submitTransfer() {
      get(this, 'transfers').setTransferState({
        tickets: get(this, 'selectedTickets'),
        email: get(this, 'transferToEmail'),
        message: get(this, 'transferMessage')
      });

      // TODO: Use replaceRoute when https://github.com/emberjs/ember.js/issues/15179 is resolved
      this.transitionToRoute('new.modal.confirm').method('replace');
    }
  }
});
