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

  dateMoment: momentComputed('date'),

  active: computed('dateMoment', 'selectedDate', function() {
    const dateMoment = this.get('dateMoment');
    const selectedDate = this.get('selectedDate');

    if (dateMoment && selectedDate) {
      return dateMoment.isSame(selectedDate, 'day');      
    }
  }),

  click() {
    this.sendAction('on-click', this.get('date'));
  }
});
