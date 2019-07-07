const TodoistAPI = require('todoist-js').default;
const { TODOIST } = require('../env');

const todoist = new TodoistAPI(TODOIST.ACCESS_TOKEN);

module.exports = todoist;
