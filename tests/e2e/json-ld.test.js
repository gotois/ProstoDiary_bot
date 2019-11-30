const validator = require('validator');

module.exports = async (t) => {
  t.timeout(5000);
  const { get } = require('../../src/services/request.service');
  const www = 'localhost:9000/id/0000000000000/all';
  const html = (await get(www)).toString('utf8');
  if (!validator.isURL(www)) {
    throw new Error('wrong www');
  }
  const jsonld = {};
  if (validator.isJSON(html)) {
    const ldObject = JSON.parse(html);
    for (const key in ldObject) {
      if (ldObject.hasOwnProperty(key)) {
        jsonld[key] = ldObject[key];
      }
    }
  } else {
    // todo добавить возможность указывать сайты визитки, где данные будут прописаны внутри тега script
  }
  const id = jsonld['@id'];
  const context = JSON.stringify(jsonld['@context']);
  const type = jsonld['@type'];
  const email = jsonld['email'];
  const name = jsonld['name'];
  t.true(true);
};
