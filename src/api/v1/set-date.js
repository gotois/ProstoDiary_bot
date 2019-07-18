const dbEntries = require('../../database/entities.database');
const crypt = require('../../services/crypt.service');
const format = require('../../services/format.service');
const datetime = require('../../services/date.service');
const commands = require('../../commands');

module.exports = async (text, message_id, match, currentUser) => {
  const input = text.replace(commands.SETDATE.alias, '').trim();
  const date = datetime.convertToNormalDate(match[1]);
  await dbEntries.post(
    currentUser.id,
    crypt.encode(input),
    message_id,
    new Date(),
    date,
  );
  const previousInput = format.previousInput(input);
  return previousInput;
};
