import Ember from 'ember';
import momentComputed from 'ember-moment/computeds/moment';
import DateCalendar from './ff-date-calendar';
import layout from '../templates/components/ff-date-range-calendar';

const {
  computed
} = Ember;

const {
  reads,
  or
} = computed;

export default DateCalendar.extend({
  layout,

  prevIconClass: 'someDefaultClass',

  classNames: ['ff-date-range-calendar'],

  startMoment: momentComputed('range.start'),
  endMoment: momentComputed('range.end'),

  /**
   * if `startDate` is the same as `endDate`
   *
   * @property isSingleDate
   */
  isSingleDate: computed('startMoment', 'endMoment', function() {
    const startMoment = this.get('startMoment');
    const endMoment = this.get('endMoment');

    return startMoment.isSame(endMoment, 'day');
  }),

  actions: {
    /**
     * Sets a date depending on the state of the DateRangeCalendarDay.
     *
     * @method selectDate
     * @param [date] {Date} The date to set
     */
    selectDate(date) {
      const startMoment = this.get('startMoment');

      if (!startMoment || !this.get('isSingleDate')) {
        this.sendAction('on-change', { start: date.toDate(), end: date.toDate() });
      } else {
        if (startMoment.isAfter(date)) {
          this.sendAction('on-change', { start: date.toDate(), end: startMoment.toDate() } );
        } else {
          this.sendAction('on-change', { start: startMoment.toDate(), end: date.toDate() });
        }
      }
    }
  }
});
