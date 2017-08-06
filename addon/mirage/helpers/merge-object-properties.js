import { camelize } from 'ember-string';
import set from 'ember-metal/set';
import get from 'ember-metal/get';
import { RestSerializer } from 'ember-cli-mirage';
import { isEmberArray } from 'ember-array/utils';

const {
  keys
} = Object;

export function getHashForResource() {
  const [json, addToIncludes] = RestSerializer.prototype.getHashForResource.apply(this, arguments);
  const performConfigs = mergeAllConfigs(this.mergedConfigs || []);

  const res = [
    isEmberArray(json) ? json.map(performConfigs) : performConfigs(json),
    addToIncludes
  ];

  return res;
}

export function makeMergeConfig(prefix, attr, keyMap = {}) {
  return (json) => {
    return mergeObjectProperties(prefix, attr, json, keyMap);
  };
}

function mergeAllConfigs(configs) {
  return (json) => {
    configs.forEach((config) => {
      config(json);
    });

    return json;
  }
}

function mergeObjectProperties(prefix, attr, json, keyMap = {}) {
  const prefixTest = new RegExp(`^${prefix}`);

  // Add the merged object.
  const merged = json[attr] || {};

  keys(json)
    .filter(key => key !== attr && prefixTest.test(key))
    .forEach(key => {
      if (key in keyMap) {
        setNestedPath(merged, keyMap[key], json[key]);
      } else {
        const newKey = camelize(key.replace(prefixTest, ''));
        merged[newKey] = json[key];
      }

      delete json[key];
    });

  json[attr] = merged;
}

function setNestedPath(obj, path, value) {
  const parts = path.split('.');
  let curPath = parts.shift();

  parts.forEach((part) => {
    if (!get(obj, curPath)) {
      set(obj, curPath, {});
    }

    curPath += `.${part}`;
  });

  set(obj, path, value);
}
