import Service from 'ember-service';
import get from 'ember-metal/get';
import set from 'ember-metal/set';

export default Service.extend({
  selectedTickets: null,
  transferToEmail: '',
  transferMessage: '',

  setTransferState({ tickets, email, message }) {
    set(this, 'selectedTickets', tickets);
    set(this, 'transferToEmail', email);
    set(this, 'transferMessage', message);
  },

  getTransferState() {
    return {
      email: get(this, 'transferToEmail'),
      tickets: get(this, 'selectedTickets'),
      message: get(this, 'transferMessage')
    };
  }
});
