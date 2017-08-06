import { test } from 'ember-qunit';
import { moduleForComponent } from 'dummy/tests/helpers/test-module-for-engine';
import { next } from 'ember-runloop';
import hbs from 'htmlbars-inline-precompile';
import RSVP from 'rsvp';

const { Promise } = RSVP;

moduleForComponent('tta-if-resolved', 'Integration | Component | tta if resolved', {
  integration: true
});

test('it yields inverse until promises resolve', function(assert) {
  const done = assert.async();

  let resolvePromise;
  this.set('promise', new Promise((resolve) => { resolvePromise = resolve }));

  this.render(hbs`
    {{#tta-if-resolved promise as |val|}}
      <div class="loaded">{{val.name}}</div>
    {{else}}
      <div class="loading">Loading</div>
    {{/tta-if-resolved}}
  `);

  assert.equal(this.$('.loading').text().trim(), 'Loading');

  resolvePromise({ name: 'Loaded' });

  dblNext(() => {
    assert.equal(this.$('.loaded').eq(0).text().trim(), 'Loaded');
    done();
  });
});

// This allows concurrency & animations to complete.
function dblNext(cb) {
  return next(() => {
    next(cb);
  });
}
