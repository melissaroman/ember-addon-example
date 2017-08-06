const ANIMATION_DURATION = 1000;

export default function() {
  this.setDefault({ duration: ANIMATION_DURATION });

  this.transition(
    this.fromRoute('animation-test.step-1'),
    this.toRoute('animation-test.step-2'),
    this.use('circle-mask-out', '.circle-animation-target'),
    this.reverse('circle-mask-in', '.circle-animation-in-target')
  );

  this.transition(
    this.fromRoute('animation-test.step-2'),
    this.toRoute('animation-test.step-3'),
    this.use('circle-mask-in', '.circle-animation-in-target')
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
}
