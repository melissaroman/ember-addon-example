import Ember from 'ember';
import moment from 'moment';

const {
  computed
} = Ember;

export default Ember.TextField.extend({
  classNames: ['ff-date-input'],

  value: computed('date', {
    get() {
      const date = this.get('date');

      return date ? moment(date).format('MM/DD/YYYY') : '';
    },

    set(key, formattedDate) {
      if (formattedDate.match(/\d\d\/\d\d\/\d\d\d\d/)) {
        const date = moment(formattedDate, 'MM/DD/YYYY');

        if (!date.isSame(this.get('date'), 'day')) {
          this.sendAction('on-change', date.toDate());
        }
      }

      return formattedDate;
    }
  })
});
