const { v1: uuidv1 } = require('uuid');

module.exports = async (t) => {
  t.timeout(5000);
  const dialogService = require('../../src/services/dialog.service');
  const dialogflowResult = await dialogService.search(
    'бот покажи все траты',
    uuidv1(),
  );
  t.log('dialogflowResult', dialogflowResult);
};
