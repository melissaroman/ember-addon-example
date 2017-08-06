import Route from 'ember-route';
import NewTransferStateModelMixin from '../../../mixins/new-transfer-state-model';

export default Route.extend(NewTransferStateModelMixin, {
  setupController() {
    this._super(...arguments);
    this.send('resetTransfer');
  }
});