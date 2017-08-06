export default {
  ticketfly: 'Ticketfly',
  topbar: {
    transfer: 'Transfer Tickets',
    back_to_orders: 'Back to Order Details',
    back_to_orders_mobile: 'Back'
  },
  general: {
    email: 'Email'
  },
  declined: '{{count}} Declined',
  comparison: {
    aofb: "{{countA}} of {{countB}}"
  },
  actions: {
    decline: 'Decline',
    decline_all: 'Decline All',
    back: 'Back',
    accept: {
      one: 'Accept {{count}} Ticket',
      other: 'Accept {{count}} Tickets'
    },
    dismiss: 'Dismiss',
    done: 'Done',
    cancel: 'Cancel',
    transfer: 'Transfer',
    undo: 'Undo',
    submit: 'Submit',
    review_and_transfer: 'Review & Transfer'
  },
  marketing: {
    terms_and_conditions: 'Terms & Conditions',
    accept_promotions: 'Send me information about special offers and events from {{venueName}} and Ticketfly.',
    t_and_c_agree: 'I agree to the Terms & Conditions',
  },
  terms_and_conditions: {
    title: 'Ticket Transfers',
    transfer: `
      <p>I acknowledge and agree that I want to transfer my Ticket(s) to a third party.</p>
      <p>I can check on the status of the Ticket Transfer as follows:</p>
      <ul>
        <li>Log in to my account</li>
        <li>Go to Order</li>
        <li>Click on Order Number</li>
        <li>Select Transfer Ticket</li>
      </ul>
      <p>
        The third party can also transfer the Ticket to another person or back to me. If I complete the Ticket
        Transfer but I subsequently physically receive the Tickets, I acknowledge and agree that those Tickets
        are no longer valid Tickets – they will have been voided. I acknowledge and agree to the foregoing terms
        and condition associated with Ticket Transfer as website.
      </p>
    `
  },
  transfer_request: {
    load_error_toast: 'Error: No transferable tickets.',
    load_error: 'No transferable tickets found.',
    sent_successful: 'Transfer request sent!',
    // TODO: Unsuccessful text Needs input from Hai/Jake.
    send_error: 'Your transfer request encountered an error. Please try again later.',
    confirm: 'Are you sure you want to send this transfer request?',
    recipient_notify: 'Your friend will get an email to<br>accept and complete the transfer.',
    select_tickets: 'Select Tickets',
    transfer_to: 'Transfer To',
    transfer_disabled: 'Transfer feature disabled',
    transferred_to: 'Transferred to<br>{{email}}',
    no_transfer_to_self: {
      zero: 'You cannot transfer to yourself.',
      one: 'You cannot transfer this ticket to yourself.',
      other: 'You cannot transfer these tickets to yourself.'
    },
    awaiting_acceptance_from: 'Awaiting acceptance from<br>{{email}}',
    by_submitting_line1: 'By continuing, you are agreeing to the',
    by_submitting_line2: 'Ticket Transfer Terms & Conditions',
    add_personal_message: 'Add personal message',
    clear_message: 'Clear',
    personal_message_placeholder: 'Enjoy the show!',
    cancel_confirm: 'Are you sure you want to<br>cancel this transfer request?',
    cancel_confirm_button: 'Cancel transfer',
    cancel_recipient_notify: 'The recipient will be notified<br>of the cancellation.',
    cancel_success: 'Transfer cancelled.',
    cancel_error: 'We are unable to complete your request. Please try again later.',
    sent_successful_message: `
      will get an email to accept your tickets.<br>
      We'll let you know when they're accepted<br>
      and the tickets will no longer be valid in<br>
      your order.
    `
  },
  accept_transfer: {
    accepted: 'Tickets accepted!',
    declined: 'Tickets declined.',
    see_my_orders: 'View my orders',
    by_accepting_line1: 'By continuing, you are agreeing to the',
    by_accepting_line2: 'Ticket Transfer Terms & Conditions',
    sent_tickets: '{{name}} sent you tickets.',
    accept_tickets: 'Would you like to accept?',
    accept_error: 'We are unable to complete your request. Please try again later.',
    sent_by: 'Sent by {{name}}',
    header_states: {
      CANCELLED: 'Ticket transfer cancelled.',
      COMPLETED: 'You can no longer accept this transfer because it has already been accepted.',
      DENIED: 'Ticket transfer declined.',
      NOT_ACCEPTABLE: 'You can no longer accept this transfer.',
      STATUS: 'Status:'
    },
    transfer_states: {
      CANCELLED: 'Cancelled',
      COMPLETED: 'Accepted',
      DENIED: 'Declined'
    },
    order_information: 'Order Information',
    first_name_input: 'First',
    last_name_input: 'Last',
    first_name_label: 'First Name',
    last_name_label: 'Last Name',
    first_name_required: 'First name required.',
    last_name_required: 'Last name required.',
    accept_tickets_already_belong_to_you: 'You\'re trying to accept tickets<br>that already belong to this account:',
    switch_accounts: 'Switch Accounts'
  },
  ticket: {
    barcode: 'Barcode:',
    seat: 'Seat',
    row: 'Row',
    section: 'Section'
  },
  event: {
    door_time: 'Doors {{time}}',
    show_time: 'Show {{time}}',
    location: '{{name}}, {{city}}, {{state}}'
  }
};
