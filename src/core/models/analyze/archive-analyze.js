const Abstract = require('../abstract');
const { unpack } = require('../../../services/archive.service');

module.exports = async (abstract) => {
  const zipMap = await unpack(abstract.buffer);
  for (const [filename, buffer] of zipMap) {
    const DynamicAbstract = await Abstract.getAbstractFromDocument(buffer);
    const anyAbstract = new DynamicAbstract({
      ...abstract._data,
      buffer: buffer,
      filename,
    });
    await anyAbstract.prepare();
    abstract._objectContext.push(anyAbstract.context);
  }
};
