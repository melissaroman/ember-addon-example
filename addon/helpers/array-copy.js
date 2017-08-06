import Helper from 'ember-helper';
import { A, isEmberArray } from 'ember-array/utils';

export function arrayCopy([array]) {
  return asArray(array).slice(0);
}

function asArray(obj) {
  if (obj === null || obj === undefined) {
    return [];
  }
  
  return isEmberArray(obj) ? obj : A([obj]);
}

export default Helper.helper(arrayCopy);
