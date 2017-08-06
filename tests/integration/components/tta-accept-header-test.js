import { test } from 'ember-qunit';
import { moduleForComponent } from 'dummy/tests/helpers/test-module-for-engine';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('tta-accept-header', 'Integration | Component | tta accept header', {
  integration: true
});

test('it uses the correct attributes for acceptable transfer based on what is available', function(assert) {
  this.set('transfer', {
    isAcceptable: true,
    sender: {
      firstName: 'Spencer',
      email: 'spencer.price@ticketfly.com'
    }
  });

  this.render(hbs`{{tta-accept-header transfer=transfer}}`);

  assert.equal(this.$('h2').text().trim().replace(/\n+/g, ' ').replace(/\s+/g, ' '), 'Spencer sent you tickets. Would you like to accept?');

  this.set('transfer', {
    isAcceptable: true,
    sender: {
      firstName: undefined,
      email: 'spencer.price@ticketfly.com'
    }
  });

  assert.equal(this.$('h2').text().trim().replace(/\n+/g, ' ').replace(/\s+/g, ' '), 'spencer.price@ticketfly.com sent you tickets. Would you like to accept?');
});

test('it shows the correct header message if transfer was already accepted', function(assert) {
  this.set('transfer', {
    isAcceptable: false,
    isPending: false,
    status: 'COMPLETED'
  });

  this.render(hbs`{{tta-accept-header transfer=transfer}}`);

  assert.equal(this.$('h2').text().trim(), 'You can no longer accept this transfer because it has already been accepted.');
});

test('it shows the correct header message if transfer was not previously accepted', function(assert) {
  this.set('transfer', {
    isAcceptable: true,
    isPending: true,
    status: 'PENDING',
    sender: {
      firstName: undefined,
      email: 'spencer.price@ticketfly.com'
    }
  });

  this.render(hbs`{{tta-accept-header transfer=transfer}}`);
  this.set('transfer.status', 'COMPLETED');
  this.set('transfer.isAcceptable', false);
  this.set('transfer.isPending', false);

  assert.equal(this.$('h2').text().trim().replace(/\n+/g, ' ').replace(/\s+/g, ' '), 'spencer.price@ticketfly.com sent you tickets.');
});

test('it shows the cancelled message if transfer was cancelled', function(assert) {
  this.set('transfer', {
    isAcceptable: false,
    isPending: false,
    status: 'CANCELLED'
  });

  this.render(hbs`{{tta-accept-header transfer=transfer}}`);

  assert.equal(this.$('h2').text().trim(), 'Ticket transfer cancelled.');
});

test('it shows the declined message if transfer was denied', function(assert) {
  this.set('transfer', {
    isAcceptable: false,
    isPending: false,
    status: 'DENIED'
  });

  this.render(hbs`{{tta-accept-header transfer=transfer}}`);

  assert.equal(this.$('h2').text().trim(), 'Ticket transfer declined.');
});

test('it shows unacceptable message if transfer is not acceptable', function(assert) {
  this.set('transfer', {
    isAcceptable: false,
    isPending: true,
    acceptanceState: {
      acceptable: false,
      description: 'Not acceptable!'
    }
  });

  this.render(hbs`{{tta-accept-header transfer=transfer}}`);

  assert.equal(this.$('h2').text().trim().replace(/[\s\n]+/g, ' '), 'You can no longer accept this transfer. Status: Not acceptable!');
});
