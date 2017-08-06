import Route from 'ember-route';
import RSVP from 'rsvp';
import get from 'ember-metal/get';
import { assign } from 'ember-platform';
import { task } from 'ember-concurrency';
import set from 'ember-metal/set';
import service from 'ember-service/inject';

const { hash, all } = RSVP;

export default Route.extend({
  metrics: service(),
  store: service(),

  model() {
    const store = get(this, 'store');
    const user = store.queryRecord('user', { me: true });
    const acceptModel = assign({ user }, this.modelFor('accept'));

    // Also, fetch the marketing preferences.
    acceptModel.marketingPreference = get(this, 'getMarketingPreference').perform(acceptModel.event, user);

    return acceptModel;
  },

  setupController(controller, model) {
    this._super(...arguments);

    hash(model).then((resolvedModel) => {
      const { user } = resolvedModel;

      set(controller, 'resolvedModel', resolvedModel);

      // Track that we've identified the currently logged in user.
      user.identifyUserForMetrics();
    }).catch(() => {
      this.send('acceptFailed');
    });
  },

  getMarketingPreference: task(function *(eventPromise, userPromise) {
    const store = get(this, 'store');

    const [event, user] = yield all([eventPromise, userPromise]);

    const orgId = get(event, 'organizationId');
    const userId = get(user, 'id');

    const membershipArray = yield store.query('marketing-membership', { userId, orgId });
    let membership = get(membershipArray, 'firstObject');

    if (!membership) {
      membership = store.createRecord('marketing-membership', {
        orgId,
        userId,
        emailSubscription: this.defaultValueForOrg(membershipArray, orgId),
      });
    }

    return membership;
  }),

  defaultValueForOrg(membershipArray, orgId) {
    const defaultMemberships = get(membershipArray, 'meta.defaultMemberships') || [];
    const membership = defaultMemberships.find((defaultMembership) => {
      return `${defaultMembership.orgId}` === `${orgId}`;
    });

    if (!membership) {
      return true;
    } else {
      return membership.defaultEmailSub;
    }
  },

  afterModel({ transfer }) {
    if (!get(transfer, 'isAcceptable')) {
      this.replaceWith('accept.index');
    }
  }
});
