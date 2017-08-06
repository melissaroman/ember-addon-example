import Ember from 'ember';
const { testing } = Ember;

const ANIMATION_DURATION = testing ? 0 : 250;
const CIRCLE_MASK_DURATION = testing ? 0 : 400;
const TOAST_ERROR_TIMEOUT = testing ? 0 : 10000;
const TOAST_SUCCESS_TIMEOUT = testing ? 0 : 5000;

export {
  CIRCLE_MASK_DURATION,
  TOAST_ERROR_TIMEOUT,
  TOAST_SUCCESS_TIMEOUT,
  ANIMATION_DURATION
};
