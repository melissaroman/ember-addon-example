import Component from 'ember-component';
import set from 'ember-metal/set';
import get from 'ember-metal/get';
import layout from '../templates/components/tta-transfer';
import { task } from 'ember-concurrency';
import { A } from 'ember-array/utils';
import { tryInvoke } from 'ember-utils';
import computed, {
  and,
  match,
  not,
  notEmpty,
  reads
} from 'ember-computed';

export default Component.extend({
  layout,

  // attrs
  'submit-transfer': function() {},
  events: computed(() => A()),
  transferToEmail: '',
  transferMessage: '',
  selectedTickets: computed(() => A()),

  hasProvidedEmail: match('transferToEmail', /^.+@.+\..+$/),
  hasSelectedItem: notEmpty('selectedTickets'),
  canTransfer: and('hasProvidedEmail', 'hasSelectedItem', 'emailIsNotSelf'),
  cannotTransfer: not('canTransfer'),
  resolvedEvent: reads('getEventAndTickets.lastComplete.value.event'),
  resolvedTickets: reads('getEventAndTickets.lastComplete.value.tickets'),

  emailIsNotSelf: computed('transferToEmail', 'user.email', {
    get() {
      return get(this, 'transferToEmail') !== get(this, 'user.email');
    }
  }),

  getEventAndTickets: task(function * () {
    const event = yield get(this, 'event');
    const tickets = yield get(this, 'tickets');

    return { event, tickets };
  }).restartable().on('didReceiveAttrs'),

  actions: {
    submitTransfer() {
      // Make sure we blur any inputs as this may have been triggered
      // by hitting 'enter' while still focused on an input.
      this.$('input').blur();

      if (get(this, 'canTransfer')) {
        tryInvoke(this, 'submit-transfer');
      }
    },
    selectTickets(selectedTickets) {
      set(this, 'selectedTickets', selectedTickets);
    }
  }
});
