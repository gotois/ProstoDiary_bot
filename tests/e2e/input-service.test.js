module.exports = async (t) => {
  const { inputProcess } = require('../../src/services/input.service');
  // const resultStoryRus = await inputProcess('поел салат с сыром');
  // const resultStoryRusDefinition = await resultStoryRus.definition();
  // t.log(resultStoryRusDefinition);

  const resultStoryEng = await inputProcess(
    'Hello good@gmail.com my friend +79881112341 Alena https://google.com',
  );
  const resultStoryEngDefinition = await resultStoryEng.definition();
  t.log(resultStoryEngDefinition);
};
