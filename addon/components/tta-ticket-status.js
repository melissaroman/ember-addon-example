import Component from 'ember-component';
import layout from '../templates/components/tta-ticket-status';

export default Component.extend({
  layout,

  hook: 'tta_ticket_row_transfer_column',
  classNames: 'text-n6',
  classNameBindings: ['ticket.transfer.isTransferred:opacity-05']
});
