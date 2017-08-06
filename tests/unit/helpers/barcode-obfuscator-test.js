import { barcodeObfuscator } from 'ticket-transfer-addon/helpers/barcode-obfuscator';
import { module, test } from 'qunit';

module('Unit | Helper | barcode obfuscator');

test('it works', function(assert) {
  const result = barcodeObfuscator(['123456789']);

  assert.equal(result, '*****6789');
});

test('it converts to a string if other type', function(assert) {
  const result = barcodeObfuscator([12345]);

  assert.equal(result, '*2345');
});

test('it returns an empty string if original is empty string', function(assert) {
  const result = barcodeObfuscator(['']);

  assert.equal(result, '');
});

test('it returns an empty string if original is null', function(assert) {
  const result = barcodeObfuscator([]);

  assert.equal(result, '');
});
