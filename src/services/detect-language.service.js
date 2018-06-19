const franc = require('franc');

const ENG = 'eng';
const RUS = 'rus';

const getLangCode = (francCode) => {
  let languageCode;
  
  switch (francCode) {
    case RUS: {
      languageCode = 'ru';
      break;
    }
    default: {
      languageCode = 'en';
      break;
    }
  }
  
  return languageCode;
};

const detectLang = (query) => {
  return franc(query, {whitelist: [ENG, RUS]});
};

module.exports = {
  detectLang,
  getLangCode,
};
