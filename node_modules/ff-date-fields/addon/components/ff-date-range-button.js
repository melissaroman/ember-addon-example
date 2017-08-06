import Ember from 'ember';
import momentComputed from 'ember-moment/computeds/moment';
import layout from '../templates/components/ff-date-button';

const {
  computed
} = Ember;


export default Ember.Component.extend({
  layout: layout,

  tagName: 'button',

  classNames: ['ff-date-button'],

  classNameBindings: ['active'],

  /**
   * The bound date value
   *
   * @property date
   */
  date: null,

  startMoment: momentComputed('range.start'),
  endMoment: momentComputed('range.end'),

  active: computed('startMoment', 'endMoment', 'selectedRange', function() {
    const startMoment = this.get('startMoment');
    const endMoment = this.get('endMoment');
    const { start, end } = this.get('selectedRange') || {};

    if (startMoment && endMoment && start && end) {
      return startMoment.isSame(start, 'day') && endMoment.isSame(end, 'day');
    }
  }),

  click() {
    this.sendAction('on-click', this.get('range'));
  }
});
