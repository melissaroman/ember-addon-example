import Ember from 'ember';
import moment from 'moment';
import layout from '../templates/components/ff-date-calendar';

const { computed } = Ember;
const { reads } = computed;

/**
 * @module FfDateCalendar
 *
 * Date calendar component
 */
export default Ember.Component.extend({
  layout,
  classNames: ['ff-date-calendar'],


  currentMonthFormat: 'MMMM YYYY',

  /**
   * Initializes the calendar to the current month
   */
  init(...args) {
    this._super(...args);

    const date = this.get('date') || new Date();

    this.set('currentMonth', moment(date).startOf('month'));
  },

  /**
   * The first letter of each day of the week.
   *
   * @property dayNames
   */
  dayNames: computed(function() {
    const week = Ember.A();
    const currentDay = moment().startOf('week');

    for (let iDay = 0; iDay < 7; iDay++) {
      week.push(currentDay.clone().toDate());
      currentDay.add(1, 'day');
    }

    return Ember.A(week.map(function (day) {
      return moment(day).format('dd').substr(0, 1);
    }));
  }),

  /**
   * The weeks of the current month. This instantiates a `dayClass`
   * for each day, and then pushes the day onto a week.
   *
   * @property weeks
   */
  weeks: computed('currentMonth', function() {
    const currentMonth = this.get('currentMonth');

    const endOfMonth = currentMonth.clone().endOf('month');
    const currentDay = currentMonth.clone().startOf('week');
    const weeks = Ember.A();

    while (currentDay.isBefore(endOfMonth)) {
      let week = Ember.A();

      for (let iDay = 0; iDay < 7; iDay++) {
        week.push(currentDay.clone());

        currentDay.add(1, 'day');
      }

      weeks.push(week);
    }

    return weeks;
  }),

  actions: {
    /**
     * Sets the current month to the previous month
     *
     * @method previousMonth
     */
    previousMonth() {
      this.get('currentMonth').subtract(1, 'month').startOf('month');
      // Since `subtract` mutates the moment object directly, no need to set it
      this.propertyDidChange('currentMonth');
    },

    /**
     * Sets the current month to the next month
     *
     * @method nextMonth
     */
    nextMonth() {
      this.get('currentMonth').add(1, 'month').startOf('month');
      // Since `add` mutates the moment object directly, no need to set it
      this.propertyDidChange('currentMonth');
    },

    /**
     * Selects a date
     *
     * @method selectDate
     * @param [date] The date to select
     */
    selectDate(date) {
      const selectedDate = this.get('date');

      if (!selectedDate || !date.isSame(selectedDate, 'day')) {
        this.sendAction('on-change', date.toDate());
      }
    }
  }
});
