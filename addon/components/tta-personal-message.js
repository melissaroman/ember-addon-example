import Component from 'ember-component';
import set from 'ember-metal/set';
import get from 'ember-metal/get';
import layout from '../templates/components/tta-personal-message';
import { tryInvoke } from 'ember-utils';

export default Component.extend({
  layout,

  isAddingMessage: false,
  maxlength: 1000,
  message: '',

  updateMessage(message) {
    const truncatedMessage = message.substr(0, get(this, 'maxlength'));
    set(this, 'message', truncatedMessage);
    tryInvoke(this, 'action', [truncatedMessage]);
  },

  actions: {
    toggleMessage() {
      this.updateMessage('');
      this.toggleProperty('isAddingMessage');
    },
    updateMessage(message) {
      this.updateMessage(message);
    }
  }
});
