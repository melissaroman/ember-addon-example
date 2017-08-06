import { test } from 'ember-qunit';
import { moduleForComponent } from 'dummy/tests/helpers/test-module-for-engine';
import { $hook, initialize as initializeHook } from 'ember-hook';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('tta-ticket-status', 'Integration | Component | tta ticket status', {
  integration: true,

  beforeEach() {
    initializeHook();
  }
});

test('it renders shows status', function(assert) {
  this.set('ticket', {
    transferState: {
      description: 'Pending'
    }
  });

  this.render(hbs`{{tta-ticket-status ticket=ticket}}`);

  assert.equal($hook('tta_ticket_row_transfer_status').text().trim(), 'Pending', 'the text is rendered');
});

test('it optionally renders the cancel link if canceleable', function(assert) {
  this.set('ticket', {
    transfer: {
      isCancelable: false
    }
  });

  this.render(hbs`{{tta-ticket-status ticket=ticket}}`);

  assert.equal($hook('tta_ticket_row_cancel').length, 0, 'cancel is not visible');

  this.set('ticket', {
    transfer: {
      isCancelable: true
    }
  });

  assert.equal($hook('tta_ticket_row_cancel').length, 1, 'cancel is visible');
});
