const Eyo = require('eyo-kernel');
const { spellText } = require('./speller.service');
const { detectLang, isRUS, isENG } = require('./detect-language.service');
const logger = require('./logger.service');

module.exports = async (text) => {
  const language = detectLang(text).language;
  // ёфикация текста
  if (isRUS(language)) {
    const safeEyo = new Eyo();
    safeEyo.dictionary.loadSafeSync();
    text = safeEyo.restore(text);
  } else if (isENG(language)) {
    // english rules ...
  } else {
    // пока только поддерживаем EN, RU
    logger.warn('Unsupported language');
  }
  try {
    const yandexSpellLanguageCode = language.slice(0, 2);
    text = await spellText(text, yandexSpellLanguageCode);
  } catch (error) {
    logger.error(error);
  }

  // Исправление кастомных типов
  // (Например, "к" = "тысяча", преобразование кастомных типов "37C" = "37 Number Celsius")
  // 	.9 -> 0.9
  // ...
  return text;
};
