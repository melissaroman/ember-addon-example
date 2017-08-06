import get from 'ember-metal/get';
import set, { setProperties } from 'ember-metal/set';
import { test } from 'ember-qunit';
import { moduleForComponent } from 'dummy/tests/helpers/test-module-for-engine';
import hbs from 'htmlbars-inline-precompile';
import { $hook, hook, initialize as initializeHook } from 'ember-hook';
import { setBreakpointForIntegrationTest } from '../../../tests/helpers/responsive';

moduleForComponent('tta-ticket-row', 'Integration | Component | tta ticket row', {
  integration: true,

  beforeEach() {
    initializeHook();
  }
});

test('`tta-ticket-row` has class pointer when transferable', function(assert) {
  assert.expect(1);

  this.render(hbs`{{tta-ticket-row transferable=true}}`);

  assert.ok($hook('tta_ticket_row').hasClass('pointer'), 'has class');
});

test('`tta-ticket-row` does not have class pointer when not transferable', function(assert) {
  assert.expect(1);

  this.render(hbs`{{tta-ticket-row transferable=false}}`);

  assert.ok(!$hook('tta_ticket_row').hasClass('pointer'), 'does not have class');
});

test('`tta-ticket-row` does not have background-b5-10 class when the ticket is not selected', function(assert) {
  assert.expect(1);

  this.render(hbs`{{tta-ticket-row
    selected=false
  }}`);

  assert.ok(!$hook('tta_ticket_row').hasClass('background-b5-10'));
});

test('`tta-ticket-row` has background-b5-10 class when the ticket is selected', function(assert) {
  assert.expect(1);

  this.render(hbs`{{tta-ticket-row
    selected=true
  }}`);

  assert.ok($hook('tta_ticket_row').hasClass('background-b5-10'));
});

test('`tta-ticket-row` renders a checkbox if transferable', function(assert) {
  assert.expect(1);

  this.render(hbs`{{tta-ticket-row transferable=true}}`);

  assert.equal($hook('tta_ticket_row_checkbox').length, 1, 'checkbox is rendered');
});

test('`tta-ticket-row` does not render a checkbox if untransferable', function(assert) {
  assert.expect(1);

  this.set('ticket', { transfer: {} });
  this.render(hbs`{{tta-ticket-row ticket=ticket}}`);

  assert.equal($hook('tta_ticket_row_checkbox').length, 0, 'checkbox not rendered');
});

test('`tta-ticket-row` displays the correct status in desktop view', function(assert) {
  setBreakpointForIntegrationTest(this, 'greaterThanMobile');
  const testCases = [{
    expectedResponse: '',
    transferState: {
      transferable: true
    },
    transfer: null
  }, {
    expectedResponse: 'Awaiting acceptance fromaaron.burr@notprez.com',
    transferState: {
      transferable: false
    },
    transfer: {
      isPending: true,
      recipient: {
        email: 'aaron.burr@notprez.com'
      }
    }
  }, {
    expectedResponse: 'Transferred toaaron.burr@notprez.com',
    transferState: {
      transferable: false
    },
    transfer: {
      isPending: false,
      recipient: {
        email: 'aaron.burr@notprez.com'
      }
    }
  }, {
    expectedResponse: 'Transfer feature disabled',
    transferState: {
      transferable: false
    }
  }, {
    expectedResponse: 'Scanned',
    transferState: {
      transferable: false,
      description: 'Scanned'
    },
    transfer: {
      isCancelled: true
    }
  }];

  assert.expect(testCases.length);

  // In desktop view, the transfer column is a sibiling to the description
  const selector = `${hook('tta_ticket_row_description_column')} + ${hook('tta_ticket_row_transfer_column')} > ${hook('tta_ticket_row_transfer_status')}`;

  testCases.forEach((ticket) => {
    this.set('ticket', ticket);

    this.render(hbs`{{tta-ticket-row ticket=ticket media=media}}`);
    assert.equal(this.$(selector).text().trim(), get(ticket, 'expectedResponse'), 'transferable status is correct');
  });
});

test('`tta-ticket-row` displays the correct status in mobile view', function(assert) {
  setBreakpointForIntegrationTest(this, 'mobile');
  const testCases = [{
    expectedResponse: '',
    transferState: {
      transferable: true
    },
    transfer: null
  }, {
    expectedResponse: 'Awaiting acceptance fromaaron.burr@notprez.com',
    transferState: {
      transferable: false
    },
    transfer: {
      isPending: true,
      recipient: {
        email: 'aaron.burr@notprez.com'
      }
    }
  }, {
    expectedResponse: 'Transferred toaaron.burr@notprez.com',
    transferState: {
      transferable: false
    },
    transfer: {
      isPending: false,
      recipient: {
        email: 'aaron.burr@notprez.com'
      }
    }
  }, {
    expectedResponse: 'Transfer feature disabled',
    transferState: {
      transferable: false
    }
  }];

  assert.expect(testCases.length);

  // In desktop view, the transfer column is a descendant to the description
  const selector = `${hook('tta_ticket_row_description_column')} > ${hook('tta_ticket_row_transfer_column')} > ${hook('tta_ticket_row_transfer_status')}`;

  testCases.forEach((ticket) => {
    this.set('ticket', ticket);

    this.render(hbs`{{tta-ticket-row ticket=ticket media=media}}`);
    assert.equal(this.$(selector).text().trim(), get(ticket, 'expectedResponse'), 'transferable status is correct');
  });
});

test('`tta-ticket-row` triggers `toggleSelect` if it is transferable', function(assert) {
  assert.expect(1);

  const ticket = {
    transfer: null,
    transferState: {
      transferable: true
    }
  };

  setProperties(this, {
    ticket,
    actions: {
      toggleSelect() {
        assert.ok(true, 'is clickable');
      }
    }
  });

  this.render(hbs`{{tta-ticket-row
    ticket=ticket
    toggleSelect=(action 'toggleSelect')
  }}`);

  $hook('tta_ticket_row').click();
});

test('`tta-ticket-row` does not trigger `toggleSelect` if it is not transferable', function(assert) {
  assert.expect(0);

  const ticket = {
    transfer: {}
  };

  setProperties(this, {
    ticket,
    actions: {
      toggleSelect() {
        assert.ok(false, 'is clickable');
      }
    }
  });

  this.render(hbs`{{tta-ticket-row
    ticket=ticket
    toggleSelect=(action 'toggleSelect')
  }}`);

  $hook('tta_ticket_row').click();
});

test('the ticket `variantName` is displayed', function(assert) {
  assert.expect(1);

  set(this, 'ticket', { variantName: 'foo' });

  this.render(hbs`{{tta-ticket-row
    ticket=ticket
  }}`);

  assert.equal($hook('tta_ticket_row_variant_description').text().trim(), 'foo', 'text is correct');
});

test('the ticket `sectionDetails` is displayed', function(assert) {
  assert.expect(1);

  set(this, 'ticket', { properties: { section: 'foo', row: 'bar', seat: 'baz' }, variantName: 'Reserved' });

  this.render(hbs`{{tta-ticket-row
    ticket=ticket
  }}`);

  assert.equal($hook('tta_ticket_row_section_details').text().trim(), 'Section foo · Row bar · Seat baz', 'correct text');
});

test('the ticket `sectionDetails` is displayed, even if only some info is provided', function(assert) {
  assert.expect(1);

  set(this, 'ticket', { properties: { section: 'foo' }, variantName: 'General Admission' });

  this.render(hbs`{{tta-ticket-row
    ticket=ticket
  }}`);

  assert.equal($hook('tta_ticket_row_section_details').text().trim(), 'Section foo', 'correct text');
});

test('the ticket `sectionDetails` is not displayed if there are is no section, row, or seat', function(assert) {
  assert.expect(1);

  set(this, 'ticket', { variantName: 'General Admission' });

  this.render(hbs`{{tta-ticket-row
    ticket=ticket
  }}`);

  assert.equal($hook('tta_ticket_row_section_details').length, 0, 'sectionDetails not rendered');
});

test('the last 4 digits of the ticket `code` is displayed', function(assert) {
  assert.expect(1);

  set(this, 'ticket', { code: '1234567890' });

  this.render(hbs`{{tta-ticket-row
    ticket=ticket
  }}`);

  assert.equal($hook('tta_ticket_row_code').text().trim(), 'Barcode: ******7890', 'text is correct');
});

test('the ticket row is faded out if the ticket is transfered', function(assert) {
  setBreakpointForIntegrationTest(this, 'greaterThanMobile');
  assert.expect(4);

  this.set('ticket', {
    transferState: { transferable: false },
    transfer: { isTransferred: true }
  });

  this.render(hbs`{{tta-ticket-row
    ticket=ticket
    media=media
  }}`);

  assert.ok($hook('tta_ticket_row_description_column').hasClass('opacity-05'));
  assert.ok($hook('tta_ticket_row_transfer_column').hasClass('opacity-05'));

  this.set('ticket', {
    transferState: { transferable: false },
    transfer: { isTransferred: false }
  });

  assert.ok(!$hook('tta_ticket_row_description_column').hasClass('opacity-05'));
  assert.ok(!$hook('tta_ticket_row_transfer_column').hasClass('opacity-05'));
});

test('the ticket `code` is not displayed when it doesn\'t exist in the ticket', function(assert) {
  assert.expect(1);

  set(this, 'ticket', { code: null});

  this.render(hbs`{{tta-ticket-row
    ticket=ticket
  }}`);

  assert.equal($hook('tta_ticket_row_code').length , 0, 'no code is displayed');
});
