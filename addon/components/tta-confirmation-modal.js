import Component from 'ember-component';
import layout from '../templates/components/tta-confirmation-modal';

export default Component.extend({
  layout,
  classNames: ['background-white modal-border-radius margin-2 modal-belt overflow-hidden'],
  hook: 'tta_confirmation_modal'
});
