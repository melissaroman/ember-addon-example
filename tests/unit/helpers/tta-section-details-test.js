import { capitalize } from 'ember-string';
import { ttaSectionDetails } from 'ticket-transfer-addon/helpers/tta-section-details';
import { module, test } from 'qunit';

module('Unit | Helper | tta section details', {
  beforeEach() {
    this.i18n = {
      t(path) {
        const [, key] = path.split('.');
        return capitalize(key);
      }
    };
  }
});

test('it accepts a properties object', function(assert) {
  const result = ttaSectionDetails([{
    section: 'foo',
    row: 'bar',
    seat: 'baz',
    variantName: 'Reserved'
  }], {}, this.i18n);

  assert.equal(result.toString(), 'Section foo &#183; Row bar &#183; Seat baz');
});

test('it accepts individual properties', function(assert) {
  const result = ttaSectionDetails([], {
    section: 'foo',
    row: 'bar',
    seat: 'baz'
  }, this.i18n);

  assert.equal(result.toString(), 'Section foo &#183; Row bar &#183; Seat baz');
});

test('it accepts a properties object with individual overrides', function(assert) {
  const result = ttaSectionDetails([{
    section: 'foo',
    row: 'bar',
    seat: 'baz',
    variantName: 'Reserved'
  }], {
    row: 'bar2'
  }, this.i18n);

  assert.equal(result.toString(), 'Section foo &#183; Row bar2 &#183; Seat baz');
});

test('it accepts a not-complete properties object', function(assert) {
  const result = ttaSectionDetails([{
    section: 'foo'
  }], {}, this.i18n);

  assert.equal(result, 'Section foo');
});

test('it results in empty string if no details provided', function(assert) {
  const result = ttaSectionDetails([{}], {}, this.i18n);

  assert.equal(result, '');
});
