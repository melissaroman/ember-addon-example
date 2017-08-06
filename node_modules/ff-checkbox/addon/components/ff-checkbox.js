import Ember from 'ember';
import layout from '../templates/components/ff-checkbox';

export default Ember.Component.extend({
  layout: layout,
  value: null,
  classNames: ['ff-checkbox'],

  actions: {
    sendChecked(checked, value) {
      this.sendAction('on-change', checked, value);
    }
  }
});
