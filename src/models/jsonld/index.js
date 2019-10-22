const validator = require('validator');
const { get } = require('../../services/request.service');

/**
 * @param {any} value - value
 * @returns {Promise<jsonld>|Error}
 */
const save = async (value) => {
  if (!value) {
    throw new Error('Empty person value');
  }
  const jsonld = {
    telegram: null,
    email: null,
    url: null,
  };
  if (Array.isArray(value)) { // если передан через email from
    jsonld.email = value.flatMap(({ address }) => {
      return address;
    })[0];
  } else if (validator.isNumeric(value)) { // передан telegram id
    jsonld.telegram = value;
  } else if (validator.isEmail(value)) {
    jsonld.email = value;
  } else if (validator.isURL(value)) {
    const html = (await get(value)).toString('utf8');
    if (validator.isJSON(html)) {
      const ldObject = JSON.parse(html);
      for (const key in ldObject) {
        if (ldObject.hasOwnProperty(key)) {
          jsonld[key] = ldObject[key];
        }
      }
    } else {
      // todo добавить возможность указывать сайты визитки, где данные будут прописаны внутри тега script
      throw new Error('TODO');
    }
  } else if (validator.isJSON(value)) {
    Object.entries(JSON.parse(value)).forEach((key, value) => {
      jsonld[key] = value;
    });
  } else {
    throw new Error('unknown value');
  }

  // fixme записывать в jsonld или делать ответ что такой уже есть
  //   формировать View на postgersql и возвращать

  return jsonld;
};

const load = (value) => {
  // fixme загружать данные из View
  return JSON.parse(process.env.PERSON);
};

module.exports = {
  save,
  load,
};
