import Component from 'ember-component';
import layout from '../templates/components/tta-same-user-modal';
import get from 'ember-metal/get';
import set from 'ember-metal/set';
import service from 'ember-service/inject';

export default Component.extend({
  hook: 'tta_same_user_warning',
  session: service(),
  buttonIsDisabled: false,
  layout,

  actions: {
    switchAccounts() {
      if (!get(this, 'buttonIsDisabled')) {
        set(this, 'buttonIsDisabled', true);
        get(this, 'session').invalidate();
      }
    }
  }
});
