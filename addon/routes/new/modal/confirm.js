import Route from 'ember-route';
import NewTransferStateModelMixin from '../../../mixins/new-transfer-state-model';

export default Route.extend(NewTransferStateModelMixin, {
  actions: {
    showLoading() {
      this.intermediateTransitionTo('new.modal.loading');
    }
  }
});
