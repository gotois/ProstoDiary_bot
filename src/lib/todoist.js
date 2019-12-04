// todo перенести в lib/todoist.js
const TodoistAPI = require('todoist-js').default;
const { TODOIST } = require('../environment');

const todoist = new TodoistAPI(TODOIST.ACCESS_TOKEN);

module.exports = todoist;
