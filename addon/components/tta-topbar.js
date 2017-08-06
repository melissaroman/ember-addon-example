import Component from 'ember-component';
import layout from '../templates/components/tta-topbar';

export default Component.extend({
  layout,

  classNames: ['top-bar shady padding-ends-1 line-height-8 small-padding-1'],
  classNameBindings: ['media.isMobile:padding-sides-2:padding-sides-6']
});
