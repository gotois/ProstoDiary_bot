const { inputProcess } = require('../../services/input.service');

module.exports = async (text) => {
  const story = await inputProcess(text);
  const storyDefinition = await story.definition();
  return JSON.stringify(storyDefinition, null, 2);
};
