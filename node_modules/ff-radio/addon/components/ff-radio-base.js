import Ember from 'ember';

const computed = Ember.computed;

export default Ember.Component.extend({
  value: null,
  groupValue: null,
  tagName: 'input',
  type: 'radio',
  attributeBindings: ['type', 'checked', 'value', 'disabled'],

  checked: computed('value', 'groupValue', {
    get() {
      return this.get('value') === this.get('groupValue');
    },
    set(value) { return value; }
  }),

  change() {
    var value = this.get('value');
    var groupValue = this.get('groupValue');

    if (groupValue !== value) {
      // The default browser behavior changes the state of the radio before we
      // can intercept and do anything. We reset the state of the radio to false
      // and send an `on-change` action instead, which will then update the
      // state of the radio if it chooses to.
      this.element.checked = false;
      this.sendAction('on-change', value);
    }
  }
});
