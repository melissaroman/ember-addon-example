import { lineBreaker } from 'ticket-transfer-addon/helpers/line-breaker';
import { module, test } from 'qunit';

module('Unit | Helper | line breaker');

test('it creates a span node to contain all the parts', function(assert) {
  const node = lineBreaker(['test']);

  assert.equal(node.nodeName, 'SPAN');
});

test('it creates a text node if only one line of text', function(assert) {
  const node = lineBreaker(['test']);

  assert.equal(node.childNodes.length, 1);
  assert.equal(node.childNodes[0].nodeName, '#text');
});

test('it creates a <br> for each line break', function(assert) {
  const node = lineBreaker(['test\nthing']);

  assert.equal(node.childNodes.length, 3);

  assert.equal(node.childNodes[0].textContent, 'test');
  assert.equal(node.childNodes[2].textContent, 'thing');
  assert.equal(node.childNodes[1].nodeName, 'BR');
});

test('it supports double line breaks', function(assert) {
  const node = lineBreaker(['test\n\nthing']);

  assert.equal(node.childNodes.length, 4);

  assert.equal(node.childNodes[0].textContent, 'test');
  assert.equal(node.childNodes[1].nodeName, 'BR');
  assert.equal(node.childNodes[2].nodeName, 'BR');
  assert.equal(node.childNodes[3].textContent, 'thing');
});

test('it does not allow for arbitrary html', function(assert) {
  const node = lineBreaker(['<b>Hello!</b>\nthing']);

  assert.equal(node.childNodes.length, 3);

  assert.equal(node.childNodes[0].textContent, '<b>Hello!</b>');
  assert.equal(node.childNodes[2].textContent, 'thing');
  assert.equal(node.childNodes[1].nodeName, 'BR');
});
