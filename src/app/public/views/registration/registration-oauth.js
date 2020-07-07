const { SERVER } = require('../../../../environment');
/**
 * @returns {string}
 */
module.exports = () => {
  return `
    <h1>Registration Step 2</h1>
    <h2>Select OAuth2 provider</h2>
    <ul>
        <li><a href="${SERVER.HOST}/connect/yandex">Yandex</a></li>
        <li><a href="${SERVER.HOST}/connect/facebook">Facebook</a></li>
    </ul>
`;
};