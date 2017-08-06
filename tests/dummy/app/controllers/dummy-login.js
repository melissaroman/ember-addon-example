import Controller from 'ember-controller';
import service from 'ember-service/inject';
import computed, { reads } from 'ember-computed';
import get from 'ember-metal/get';
import set from 'ember-metal/set';
import { isEmpty } from 'ember-utils';

function same(a, b) {
  return (isEmpty(a) && isEmpty(b)) || a === b;
}

export default Controller.extend({
  session: service(),
  flashMessages: service(),

  token: reads('session.data.authenticated.access_token'),
  saleCode: '',
  eventId: '',
  transferId: '',
  acceptanceToken: '',

  tokenUrl: 'https://stg01.ticketfly.com/account/oauth2/authorize?client_id=6Ce1A2wf37h5S6cX847vl0kxsOr6oYnI&response_type=token',

  userInfoIsChanged: computed('session.data.{authenticated.access_token}', 'token', {
    get() {
      const token = get(this, 'session.data.authenticated.access_token');
      return !same(get(this, 'token'), token);
    }
  }),

  actions: {
    triggerToast() {
      get(this, 'flashMessages').danger('Something went wrong!', {
        timeout: 100000
      });
    },
    saveUserInfo() {
      set(this, 'session.data.userId', get(this, 'userId'));

      get(this, 'session').authenticate('authenticator:oauth2', {
        access_token: get(this, 'token'),
        expires_in: +(new Date()) + 60 * 60 * 1000 * 24 * 365,
        scope: 'this:is:a:scope',
        token_type: 'bearer'
      });
    },

    visitTransfer() {
      this.transitionToRoute('transfers.new', get(this, 'saleCode'), get(this, 'eventId'));
    },

    visitAccept() {
      this.transitionToRoute('transfers.accept', get(this, 'transferId'), {
        queryParams: {
          acceptanceToken: get(this, 'acceptanceToken')
        }
      });
    }
  }
});
