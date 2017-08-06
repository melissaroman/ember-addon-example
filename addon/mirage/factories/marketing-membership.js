import { Factory, faker } from 'ember-cli-mirage';
const { random: { uuid, boolean } } = faker;

export default Factory.extend({
  orgId: uuid,
  userId: uuid,
  emailSubscription: boolean
});
