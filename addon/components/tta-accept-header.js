import Ember from 'ember';
import get from 'ember-metal/get';
import set from 'ember-metal/set';
import layout from '../templates/components/tta-accept-header';

export default Ember.Component.extend({
  tagName: 'h2',
  hook: 'tta_accept_header_text',
  layout,

  didReceiveAttrs() {
    this._super(...arguments);
    set(this, 'wasInitiallyAcceptable', get(this, 'transfer.isPending') && get(this, 'transfer.isAcceptable'));
  }
});
