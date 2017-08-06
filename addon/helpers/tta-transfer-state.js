import get from 'ember-metal/get';
import service from 'ember-service/inject';
import Helper from 'ember-helper';

export function ttaTransferState([transferState = {}, transfer], hash, i18n) {
  const { transferable, description } = transferState;

  if (transferable) {
    return '';
  }

  const nonTransferableDescription = description || i18n.t('transfer_request.transfer_disabled');

  // If there is no transfer, provide reason.
  if (!transfer) {
    return nonTransferableDescription;
  }

  // If the transfer is cancelled, provide reason.
  if (get(transfer, 'isCancelled')) {
    return nonTransferableDescription;
  }

  const recipientEmail = get(transfer, 'recipient.email');
  const stringPath = get(transfer, 'isPending') ? 'awaiting_acceptance_from' : 'transferred_to';

  return i18n.t(`transfer_request.${stringPath}`, {
    email: recipientEmail
  });
}

export default Helper.extend({
  i18n: service(),

  compute() {
    return ttaTransferState(...arguments, get(this, 'i18n'));
  }
});

