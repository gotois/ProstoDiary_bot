const kppService = require('../../services/kpp.service');

module.exports = async (text) => {
  try {
    const kppDataResult = await kppService(text);
    // todo добавлять это в StoryJSON
    return {
      jsonrpc: '2.0',
      result: kppDataResult,
    };
  } catch (error) {
    return {
      jsonrpc: '2.0',
      error: {
        message: error.toString(),
      },
    };
  }
};
