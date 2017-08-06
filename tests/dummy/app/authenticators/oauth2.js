import Base from 'ember-simple-auth/authenticators/base';
import RSVP from 'rsvp';

const { resolve } = RSVP;

export default Base.extend({
  restore(data) {
    return resolve(data);
  },

  authenticate(data) {
    return resolve(data);
  },

  invalidate() {
    return resolve();
  }
});
