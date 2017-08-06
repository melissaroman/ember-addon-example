import Mixin from 'ember-metal/mixin';
import service from 'ember-service/inject';
import get from 'ember-metal/get';
import { isEmpty } from 'ember-utils';

export default Mixin.create({
  transfers: service(),

  model() {
    const transferState = get(this, 'transfers').getTransferState();

    if (isEmpty(get(transferState, 'tickets')) || isEmpty(get(transferState, 'email'))) {
      return this.replaceWith('new.index');
    }

    return transferState;
  }
});
