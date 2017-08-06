import Component from 'ember-component';
import layout from '../../templates/components/tta-show-hide/expand-button';

export default Component.extend({
  layout,

  classNames: ['pointer', 'relative'],

  toggle: () => {},

  click() {
    this.toggle();
  }
});
