import { CIRCLE_MASK_DURATION, ANIMATION_DURATION } from './utils/constants';

export default function() {
  this.setDefault({
    duration: ANIMATION_DURATION
  });

  this.transition(
    this.hasClass('tta-modal-container'),
    this.toValue(true),
    this.use('to-up'),
    this.reverse('to-down')
  );

  this.transition(
    this.matchSelector('#tta-confirmation-modal-container'),
    this.toValue((toValue, fromValue) => {
      return !fromValue;
    }),
    this.use('to-down'),
    this.reverse('to-up')
  );

  this.transition(
    this.matchSelector('#tta-toast-modal-tether'),
    this.toValue((toValue, fromValue) => {
      return !fromValue;
    }),
    this.use('to-down', {
      duration: ANIMATION_DURATION * 2,
      easing: 'easeOutSine'
    }),
    this.reverse('to-up', {
      duration: ANIMATION_DURATION * 2,
      easing: 'easeInSine'
    })
  );

  this.transition(
    this.fromRoute('new.modal.confirm'),
    this.toRoute('new.modal.terms'),
    this.use('to-left'),
    this.reverse('to-right')
  );

  this.transition(
    this.fromRoute('new.modal.confirm'),
    this.toRoute('new.modal.loading'),
    this.use('circle-mask-out', '[data-circle-mask-target]', {
      duration: CIRCLE_MASK_DURATION
    }),
    this.reverse('circle-mask-in', '[data-circle-mask-target]', {
      duration: CIRCLE_MASK_DURATION
    })
  );

  this.transition(
    this.fromRoute('new.modal.loading'),
    this.toRoute('new.modal.success'),
    this.use('circle-mask-in', '[data-circle-mask-target]', {
      duration: CIRCLE_MASK_DURATION * 3
    })
  );

  this.transition(
    this.matchSelector('#tta-confirmation-modal-overlay'),
    this.toValue((toValue, fromValue) => {
      return !toValue || !fromValue;
    }),
    this.use('fade', { maxOpacity: 0.5 })
  );

  this.transition(
    this.toRoute('accept.success'),
    this.use('fade')
  );

  this.transition(
    this.fromRoute('accept.loading'),
    this.toRoute('accept.confirm'),
    this.use('fade')
  );
}

export { CIRCLE_MASK_DURATION };
