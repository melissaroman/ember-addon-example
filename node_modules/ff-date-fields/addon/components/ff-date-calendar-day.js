import Ember from 'ember';
import layout from '../templates/components/ff-date-calendar-day';

const { computed } = Ember;

/**
 * @module FfDateCalendarDay
 *
 * Represents a day, binds computed properties to the date.
 */

export default Ember.Component.extend({
  tagName: 'td',
  layout,

  classNames: ['ff-date-calendar-day'],
  classNameBindings: ['isSelected', 'isToday', 'isNotInMonth', 'isDisabled'],

  click() {
    if (!this.get('isDisabled')) {
      this.sendAction('on-click', this.get('date'));
    }
  },

  /**
   * Day is the selected day in `dateCalendar`
   *
   * @property isSelected
   */
  isSelected: computed('selectedDate', function() {
    return this.get('date').isSame(this.get('selectedDate') || null, 'day');
  }),

  /**
   * Day is today's date
   *
   * @property isToday
   */
  isToday: computed(function() {
    return this.get('date').isSame(new Date(), 'day');
  }),

  /**
   * Day is disabled
   *
   * @property isDisabled
   */
  isDisabled: computed('minDate', 'maxDate', function() {
    const date = this.get('date');
    // Reading via computeds wouldn't pass tests, accessing directly
    const minDate = this.get('minDate') || null;
    const maxDate = this.get('maxDate') || null;

    return date.isAfter(maxDate) || date.isBefore(minDate);
  }),
  /**
  * Day is not in the current month
  *
  * @property isNotInMonth
  */

  isNotInMonth: computed('date', 'selectedMonth', function() {
    return !this.get('date').isSame(this.get('selectedMonth'), 'month');
  })
});
