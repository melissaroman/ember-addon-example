import Ember from 'ember';
import layout from '../templates/components/ff-radio';

export default Ember.Component.extend({
  layout: layout,
  value: null,
  classNames: ['ff-radio'],

  actions: {
    sendChange(value) {
      this.sendAction('on-change', value);
    }
  }
});
