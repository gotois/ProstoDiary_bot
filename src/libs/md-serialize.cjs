// Функция сериализует текст в стандарт MarkdownV2
module.exports.serializeMarkdownV2 = function (text) {
  text = text.replaceAll('.', '\\.');
  text = text.replaceAll('-', '\\-');
  text = text.replaceAll('!', '\\!');
  return text;
};
