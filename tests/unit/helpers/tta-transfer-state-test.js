import sinon from 'sinon';
import { ttaTransferState } from 'ticket-transfer-addon/helpers/tta-transfer-state';
import { module, test } from 'qunit';

module('Unit | Helper | tta transfer state', {
  beforeEach() {
    const t = this.translate = sinon.stub();
    this.i18n = { t };
  }
});

// Replace this with your real tests.
test('it renders nothing if ticket is transferable', function(assert) {
  const result = ttaTransferState([{
    transferable: true,
    description: 'READY_TO_TRANSFER'
  }], {}, this.i18n);

  assert.equal(result, '');
});

test('it renders description if ticket is not transferable', function(assert) {
  const result = ttaTransferState([{
    transferable: false,
    description: 'Non-transferable / Outdated'
  }], {}, this.i18n);

  assert.equal(result, 'Non-transferable / Outdated');
});

test('it shows state if not transferable with no transfer', function(assert) {
  this.translate.returns('Transfer Disabled');

  const result = ttaTransferState([{
    transferable: false
  }], {}, this.i18n);

  assert.equal(result, 'Transfer Disabled');
});

test('it shows state if not transferable with successful transfer', function(assert) {
  this.translate
    .withArgs('transfer_request.transferred_to', { email: 'alexander@hamilton.com' })
    .returns('Transferred to alexander@hamilton.com');

  const result = ttaTransferState([{
    transferable: false
  }, {
    isPending: false,
    recipient: {
      email: 'alexander@hamilton.com'
    }
  }], {}, this.i18n);

  assert.equal(result, 'Transferred to alexander@hamilton.com');
});

test('it shows state transfer not yet accepted', function(assert) {
  this.translate
    .withArgs('transfer_request.awaiting_acceptance_from', { email: 'alexander@hamilton.com' })
    .returns('Awaiting acceptance from alexander@hamilton.com');

  const result = ttaTransferState([{
    transferable: false
  }, {
    isPending: true,
    recipient: {
      email: 'alexander@hamilton.com'
    }
  }], {}, this.i18n);

  assert.equal(result, 'Awaiting acceptance from alexander@hamilton.com');
});

test('it shows state transfer not yet accepted even with transfer state description', function(assert) {
  this.translate
    .withArgs('transfer_request.awaiting_acceptance_from', { email: 'alexander@hamilton.com' })
    .returns('Awaiting acceptance from alexander@hamilton.com');

  const result = ttaTransferState([{
    transferable: false,
    description: 'Pending transfer'
  }, {
    isPending: true,
    recipient: {
      email: 'alexander@hamilton.com'
    }
  }], {}, this.i18n);

  assert.equal(result, 'Awaiting acceptance from alexander@hamilton.com');
});

test('it will show state description if not transferable, but has cancelled transfer', function(assert) {
  const result = ttaTransferState([
    {
      transferable: false,
      description: 'Non-resellable / Scanned'
    },
    { isCancelled: true }
  ], {}, this.i18n);

  assert.equal(result, 'Non-resellable / Scanned');
});
