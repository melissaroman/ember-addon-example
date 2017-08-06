import Component from 'ember-component';
import computed from 'ember-computed';
import get from 'ember-metal/get';
import { guidFor } from 'ember-metal/utils';
import layout from '../templates/components/tta-show-hide';

export default Component.extend({
  layout,

  contentVisible: false,

  hook: 'tta_show_hide_toggle',

  hookQualifiers: computed('contentVisible', {
    get() {
      return {
        toggled: get(this, 'contentVisible')
      };
    }
  }),

  controlsId: computed({
    get() {
      return `show-hide-id-${guidFor(this)}`;
    }
  }),

  actions: {
    toggleVisibility() {
      this.toggleProperty('contentVisible');
    }
  }
});
