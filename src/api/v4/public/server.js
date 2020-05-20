const jayson = require('jayson/promise');

// Публичный API доступный для сторонних ассистентов
module.exports = jayson.server(
  {
    backup: require('./backup'),
    help: require('./help'),
    ping: require('./ping'),
    insert: require('./insert'),
  },
  {
    useContext: true,
    params: Object,
  },
);
