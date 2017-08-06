import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import set from 'ember-metal/set';
import get from 'ember-metal/get';
import { hasMany } from 'ember-data/relationships';
import computed, { equal } from 'ember-computed';

// Constants for the various statuses of a ticket transfer.
const [PENDING, COMPLETED, DENIED, CANCELLED] = ['PENDING', 'COMPLETED', 'DENIED', 'CANCELLED'];

export default Model.extend({
  tickets: hasMany('ticket', { async: false }),
  recipient: attr(),
  sender: attr(),
  acceptanceToken: attr('string'),
  message: attr('string', { defaultValue: '' }),
  mode: attr({ defaultValue: 'RECIPIENT_ACCEPT' }),
  status: attr('string', { defaultValue: PENDING }),

  acceptanceState: attr({
    defaultValue: { acceptable: true }
  }),

  isCancelable: equal('status', PENDING),
  isPending: equal('status', PENDING),
  isTransferred: equal('status', COMPLETED),

  isCancelled: computed('status', 'isEmpty', {
    get() {
      const status = get(this, 'status');
      return !status || status === CANCELLED;
    }
  }),

  isAcceptable: computed('status', 'isSaving', 'acceptanceState.acceptable', {
    get() {
      const status = get(this, 'status');
      const isPending = status === PENDING || get(this, 'isSaving');
      return isPending && get(this, 'acceptanceState.acceptable');
    }
  }),

  accept(token) {
    const amount = get(this, 'tickets.length');
    set(this, 'acceptanceToken', token);
    set(this, 'status', amount ? COMPLETED : DENIED);
    return this;
  },

  cancel() {
    set(this, 'status', CANCELLED);
    return this;
  }
});
