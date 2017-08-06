import Ember from 'ember';
import { Promise, animate } from "liquid-fire";
const { $: e$ } = Ember;
const { sqrt, pow, max } = Math;

export function calculateBounds($boundsElement, $targetElement, selector) {
  const { xOffset, yOffset, width, height } = getTargetCenterOffset($boundsElement, selector);
  const { innerXDimension, innerYDimension, outerRadius } = calculateMaskBounds($targetElement, xOffset, yOffset);
  return { xOffset, yOffset, innerXDimension, innerYDimension, outerRadius, targetSize: max(width, height) };
}

export function makeMaskContainer($element, isMaskingOut, maskInitialCSS = {}) {
  const $parent = $element.parent();

  // Create the new "Masking" element
  const $maskElement = e$(document.createElement('div'));
  const $maskedElement = $element.clone();

  $maskElement.css(maskInitialCSS)
    .addClass('mask-element');

  // Hide the "animating" element
  $element.css({ visibility: 'hidden' });

  // And move the element inside the masking element
  $parent.append($maskElement);
  $maskedElement.appendTo($maskElement);

  // Make a closure to then remove the mask, resetting DOM to original state.
  function removeMaskElement() {
    $maskElement.remove();

    if (!isMaskingOut) {
      $element.css({ visibility: '' });
    }
  }

  return { $maskElement, $maskedElement, removeMaskElement };
}

export function animateMask(maskContainer, reverse, animationOpts, dimensions) {
  const { outerRadius, innerXDimension, innerYDimension, xOffset, yOffset, targetSize } = dimensions;
  const { $maskElement, $maskedElement, removeMaskElement } = maskContainer;

  if (!('easing' in animationOpts)) {
    animationOpts.easing = [0.645, 0.045, 0.355, 1];
  }

  const resolvedTargetSize = reverse ? targetSize : 0;
  const widthHeightSteps = steps(outerRadius * 2, resolvedTargetSize, reverse);
  
  return Promise.all([
    animate($maskElement, {
      width: widthHeightSteps.slice(0),
      height: widthHeightSteps.slice(0),
      translateX: steps(-1 * (outerRadius - innerYDimension), xOffset - resolvedTargetSize / 2, reverse),
      translateY: steps(-1 * (outerRadius - innerXDimension), yOffset - resolvedTargetSize / 2, reverse),
      borderRadius: ['100%', '100%']
    }, animationOpts, 'circle-mask'),
    animate($maskedElement, {
      translateX: steps((outerRadius - innerYDimension), -1 * xOffset + resolvedTargetSize / 2, reverse),
      translateY: steps((outerRadius - innerXDimension), -1 * yOffset + resolvedTargetSize / 2, reverse)
    }, animationOpts, 'circle-mask')
  ]).then(removeMaskElement);
}

function getTargetCenterOffset($parentElement, selector) {
  const element = $parentElement.find(selector).get(0);
  if (element) {
    const { top: parentTop, left: parentLeft } = $parentElement.get(0).getBoundingClientRect();
    const { top, left, width, height } = element.getBoundingClientRect();

    const yOffset = (top - parentTop) + (height / 2);
    const xOffset = (left - parentLeft) + (width / 2);
    return { xOffset, yOffset, width, height };
  } else {
    return { xOffset: 0, yOffset: 0 };
  }
}

function calculateMaskBounds($measuredElement, xOffset, yOffset) {
  const width = $measuredElement.width();
  const height = $measuredElement.height();
  const innerXDimension = max(yOffset, height - yOffset);
  const innerYDimension = max(xOffset, width - xOffset);
  const outerRadius = sqrt(pow(max(innerXDimension, innerYDimension), 2) * 2);

  return { innerXDimension, innerYDimension, outerRadius };
}

function steps(start, stop, reverse) {
  return reverse ? [stop, start] : [start, stop];
}
