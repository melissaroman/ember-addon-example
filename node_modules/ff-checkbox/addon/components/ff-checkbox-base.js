import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'input',
  value: null,
  type: 'checkbox',

  attributeBindings: ['type', 'checked', 'disabled', 'indeterminate', 'value'],

  change() {
    const checked = this.element.checked;
    const indeterminate = this.element.indeterminate;
    const value = this.get('value');

    // Checked and indeterminate state have been changed, but that's not DDAU!
    // Reset the change, send the action and wait for it to be changed manually
    this.element.checked = this.get('checked');
    this.element.indeterminate = this.get('indeterminate');

    this.sendAction('on-change', checked, { value, indeterminate });
  },
});
