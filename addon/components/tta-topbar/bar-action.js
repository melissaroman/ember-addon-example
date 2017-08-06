import Component from 'ember-component';
import { tryInvoke } from 'ember-utils';
import layout from '../../templates/components/tta-topbar/bar-action';

const BarAction = Component.extend({
  layout,

  hook: 'tta_top_bar_action',

  click() {
    tryInvoke(this, 'action');
  }
});

BarAction.reopenClass({
  positionalParams: ['actionText']
});

export default BarAction;
