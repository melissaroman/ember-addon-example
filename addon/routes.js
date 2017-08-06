import buildRoutes from 'ember-engines/routes';

export default buildRoutes(function() {
  this.route('new', { path: '/new/:orderId/:eventId' }, function() {
    this.route('modal', { path: '/m' }, function() {
      this.route('confirm');
      this.route('success');
      this.route('terms');
      this.route('cancel', { path: '/cancel/:transferId' });
    });
  });

  this.route('accept', { path: '/accept/:transferId' }, function() {
    this.route('success');
    this.route('confirm', function() {
      this.route('terms');
    });
  });
});
