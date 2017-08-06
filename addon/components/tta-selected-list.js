import Component from 'ember-component';
import computed from 'ember-computed';
import get from 'ember-metal/get';
import set from 'ember-metal/set';
import { A, isEmberArray } from 'ember-array/utils';
import layout from '../templates/components/tta-selected-list';

export default Component.extend({
  tagName: '',
  layout,

  allItemsList: computed('list', {
    get() {
      return A(get(this, 'list')).slice(0);
    }
  }),

  didReceiveAttrs() {
    const selected = get(this, 'selected');
    set(this, 'selectedItems', isEmberArray(selected) ? A(selected.slice()) : A());
  },

  actions: {
    toggleItem(item) {
      const selected = get(this, 'selectedItems');
      const action = get(this, 'selection-changed');

      if (selected.includes(item)) {
        selected.removeObject(item);
      } else {
        selected.pushObject(item);
      }

      if (action) {
        action(A(selected.slice(0)));
      }
    }
  }
});
