const visionService = require('../../lib/vision');
const googleStorage = require('../../lib/google-storage');

// загружаем бинарник в cloud, производим расчеты, получаем сгенерированный json, разбиваем его на объекты
module.exports = async (abstract) => {
  const filename = await googleStorage.uploadFile(
    abstract.buffer,
    abstract.filename,
  );
  const file = await visionService.pdfReader(filename);
  const storageFile = await googleStorage.getFile(file);
  const filesResponse = JSON.parse(storageFile.toString());
  const [{ fullTextAnnotation, context }] = filesResponse.responses;
  const { /* pages, */ text } = fullTextAnnotation;
  abstract.object.push({
    '@type': 'CreativeWork',
    'description': text,
    'url': context.uri,
  });
};
