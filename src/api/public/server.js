const jayson = require('jayson/promise');

// Публичный API доступный для сторонних ассистентов
module.exports = jayson.server(
  {
    backup: require('./v5/backup'),
    help: require('./v5/help'),
    ping: require('./v5/ping'),
    insert: require('./v5/insert'),
  },
  {
    useContext: true,
    params: Object,
  },
);
