import moment from 'moment';
import { capitalize } from 'ember-string';
import { pluralize } from 'ember-inflector';
import { Factory, faker } from 'ember-cli-mirage';

const {
  company: {
    catchPhraseAdjective: adjective,
    catchPhraseNoun: noun
  },
  commerce: {
    productName
  },
  image: {
    city: cityImage
  },
  address: {
    city,
    stateAbbr
  },
  date: {
    future
  },
  random: {
    uuid
  }
} = faker;

export default Factory.extend({
  name(i) {
    return `${capitalize(adjective(i))} ${pluralize(capitalize(noun(i)))}`;
  },
  topLineInfo(i) {
    if (i % 2 === 0) {
      return `${capitalize(productName())} presents`
    } else {
      return null;
    }
  },
  imageUrls(i) {
    return {
      poster: cityImage(i)
    };
  },
  doorTime(i) {
    return moment(future(i)).format();
  },
  startTime(i) {
    return moment(future(i)).format();
  },
  venueName(i) {
    return `The ${productName(i)}`;
  },
  organizationId: uuid,
  venueCity(i) {
    return city(`${i}`);
  },
  venueState: stateAbbr
});
