import Ember from 'ember';
import DateCalendarDay from './ff-date-calendar-day';

const { computed } = Ember;
const { or } = computed;

export default DateCalendarDay.extend({

  classNameBindings: ['isInRange', 'isStartDate', 'isEndDate'],

  /**
   * Day is the selected start date in `dateCalendar`
   *
   * @property isStartDate
   */
  isStartDate: computed('selectedRange.start', function() {
    return this.get('date').isSame(this.get('selectedRange.start') || null, 'day');
  }),

  /**
   * Day is the selected end date in `dateCalendar`
   *
   * @property isEndDate
   */
  isEndDate: computed('selectedRange.end', function() {
    return this.get('date').isSame(this.get('selectedRange.end') || null, 'day');
  }),

  /**
   * Day is either select start or end date in `dateCalendar`
   *
   * @property isSelected
   */
  isSelected: or('isStartDate', 'isEndDate'),

  /**
   * Day is in the selected range in `dateCalendar`
   *
   * @property isStartDate
   */
  isInRange: computed('value', 'selectedRange.start', 'selectedRange.end', function() {
    const value = this.get('date');
    const startDate = this.get('selectedRange.start') || null;
    const endDate = this.get('selectedRange.end') || null;

    return this.get('isSelected') || value.isAfter(startDate) && value.isBefore(endDate);
  }),
});
