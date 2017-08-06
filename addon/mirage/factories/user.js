import { Factory, faker } from 'ember-cli-mirage';
const {
  random: {
    uuid
  },
  name: {
    firstName,
    lastName
  },
  internet: {
    email
  }
} = faker;

export default Factory.extend({
  _authToken: uuid,
  firstName,
  lastName,
  email
});
