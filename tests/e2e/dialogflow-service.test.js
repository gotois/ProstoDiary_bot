module.exports = async (t) => {
  t.timeout(5000);
  const dialogflowService = require('../../src/lib/dialogflow');
  const dialogflowResult = await dialogflowService.detectTextIntent(
    '/search показать все траты',
  );
  t.log('dialogflowResult', dialogflowResult);
};
