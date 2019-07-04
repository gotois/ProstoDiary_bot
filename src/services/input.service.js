const Story = require('./story.service');
/**
 * @description весь pipe работы с input
 * @param {string} text - input text
 * @returns {Promise<object|Error>}
 */
const inputProcess = async (text) => {
  const story = new Story(text);
  await story.fill();
  return story;
};

module.exports = {
  inputProcess,
};
