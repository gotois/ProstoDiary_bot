const { SERVER } = require('../../environment');

module.exports = () => {
  return `
    <h1>Registration OAuth</h1>
    <ul>
        <li><a href="${SERVER.HOST}/connect/yandex">Yandex</a></li>
        <li><a href="${SERVER.HOST}/connect/facebook">Facebook</a></li>
    </ul>
`;
};
