const AbstractCommand = require('../models/abstracts/abstract-command');
/**
 * @description backup
 * @param {object} parameters - requestObject
 * @returns {Promise<AbstractCommand>}
 */
module.exports = async (parameters) => {
  const { date, token, sorting = 'Ascending' } = parameters;
  const abstractCommand = new AbstractCommand(
    {
      ...parameters,
      command: 'Backup',
    },
    {
      startTime: date,
      subjectOf: [
        {
          '@type': 'CreativeWork',
          'name': 'token',
          'abstract': token,
          'encodingFormat': 'text/plain',
          // еще может потребоваться поле dateCreated - которое будет детектировать когда этот токен пришел чтобы его лучше детектить
        },
        {
          '@type': 'CreativeWork',
          'name': 'sorting',
          'abstract': sorting,
          'encodingFormat': 'text/plain',
        },
      ],
    },
  );
  await abstractCommand.prepare();
  return abstractCommand;
};
