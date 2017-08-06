import Ember from 'ember';
import layout from '../templates/components/tta-validating-input';
import { tryInvoke } from 'ember-utils';
import get from 'ember-metal/get';
import set from 'ember-metal/set';
import computed from 'ember-computed';
import { guidFor } from 'ember-metal/utils';

export default Ember.Component.extend({
  layout,

  value: '',
  isValid: true,
  validateImmediately: false,

  didReceiveAttrs() {
    if (get(this, 'validateImmediately')) {
      set(this, 'shouldBeValidated', true);
    }
  },

  shouldBeValidated: false,
  renderInvalidState: computed('shouldBeValidated', 'isValid', {
    get() {
      return get(this, 'shouldBeValidated') && !get(this, 'isValid');
    }
  }).readOnly(),

  uniqueId: computed({
    get() {
      return guidFor(this);
    }
  }).readOnly(),

  _updateValueHasBeenEdited() {
    set(this, 'shouldBeValidated', true);
  },

  actions: {
    handleUpdate() {
      tryInvoke(this, 'on-update', [get(this, 'value')]);
    },
    valueWasEdited() {
      this._updateValueHasBeenEdited();
    },
    insertNewline(...args) {
      this._updateValueHasBeenEdited();
      tryInvoke(this, 'insert-newline', args);
    }
  }
});
