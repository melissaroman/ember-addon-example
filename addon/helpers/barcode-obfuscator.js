import Helper from 'ember-helper';

export function barcodeObfuscator([code]) {
  const { max } = Math;
  const codeString = code ? code.toString() : '';
  const asterisks = new Array(max(0, codeString.length - 3)).join('*');

  return asterisks + codeString.slice(-4);
}

export default Helper.helper(barcodeObfuscator);
