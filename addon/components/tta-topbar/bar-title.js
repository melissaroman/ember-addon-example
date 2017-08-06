import Component from 'ember-component';
import layout from '../../templates/components/tta-topbar/bar-title';

const BarTitle = Component.extend({
  layout,
  classNames: ['top-bar-title'],
  hook: 'tta_title'
});

BarTitle.reopenClass({
  positionalParams: ['titleText']
});

export default BarTitle;
