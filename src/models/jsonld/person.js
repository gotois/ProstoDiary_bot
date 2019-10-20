const validator = require('validator');

// todo покрыть тестами
module.exports = (value) => {
  const person = {
    telegramUserId: null,
    id: null,
    name: null,
    email: null,
    image: null,
    url: null,
    sameAs: [],
  };
  if (Array.isArray(value)) { // если передан через email from
    person.email = value.flatMap(({ address }) => {
      return address;
    })[0];
  } else if (validator.isNumeric(value)) { // передан telegram id
    person.telegramUserId = value;
  } else if (validator.isEmail(value)) {
    person.email = value;
  }  else if (validator.isURL(value)) {
    person.url = value;
  } else if (validator.isJSON(value)) {
    // вероятно передан JSON-LD, тогда нужно десериализовывать и заполнять
    console.log('TODO')
    xxx
  } else if (typeof value === 'object') {
    console.log('TODO')
    yyy
  } else {
    throw new Error('unknown value');
  }
  return person;
};
