import Component from 'ember-component';
import layout from '../templates/components/tta-toasts';
import service from 'ember-service/inject';

export default Component.extend({
  layout,
  flashMessages: service(),

  actions: {
    clearMessage(flash) {
      flash.destroyMessage();
    }
  }
});
