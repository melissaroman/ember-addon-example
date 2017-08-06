import { ttaInc } from 'ticket-transfer-addon/helpers/tta-inc';
import { module, test } from 'qunit';

module('Unit | Helper | tta inc');

test('it increments by 1 by default', function(assert) {
  assert.expect(1);

  const result = ttaInc([42]);

  assert.equal(result, 43, 'number is correct');
});


test('it increments by the second param if provided', function(assert) {
  assert.expect(1);

  const result = ttaInc([42, 2]);

  assert.equal(result, 44, 'number is correct');
});
