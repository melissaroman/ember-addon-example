import { arrayCopy } from 'ticket-transfer-addon/helpers/array-copy';
import { module, test } from 'qunit';

module('Unit | Helper | array copy');

test('it works with arrays', function(assert) {
  const array = [{}, {}];
  const result = arrayCopy([array]);
  assert.notEqual(array, result, 'not the same instance');
  assert.deepEqual(array, result, 'but is the same contents');
});

test('it works with falsey values', function(assert) {
  const result = arrayCopy([null]);
  assert.deepEqual(result, [], 'falsey are converted into empty arrays');
});

test('it works with non-array values', function(assert) {
  const result = arrayCopy([12]);
  assert.deepEqual(result, [12]);
});
