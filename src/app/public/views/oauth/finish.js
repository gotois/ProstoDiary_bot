const { SERVER } = require('../../../../environment');
const package_ = require('../../../../../package.json');

module.exports = ({ secret, email }) => {
  return `
        <h1>Добро пожаловать в систему ${package_.author.name}!</h1>
        <h2>Шаг 1: Настройте двухфакторную аутентификацию.</h2>
        <p>Используйте приложение для распознавания QR-кода в приложении для двухэтапной аутентификации, например, Google Authenticator.</p>
        <img src="${secret.qr}" alt="${secret.base32}">
        <br>
        <h2>Шаг 2: Сохраните логин/пароль созданного бота в надежном и секретном месте.</h2>
        <div><strong>EMAIL: </strong><pre>${email}</pre></div>
        <div><strong>PASSWORD: </strong><pre>${secret.masterPassword}</pre></div>
        <br>
        <h2>Шаг 3: завершите ручную активацию почты бота.</h2>
        <p>Бот авторизован в Яндекс PDD. Требуется зайти на новую почту и принять пользовательское соглашение.</p> <!-- todo В будущем перенести этот кусок в OIDC ассистента. -->
        <br>
        <h2>Шаг 4: Активируйте бота и выберите доступного ассистента.</h2>
        <p><a href="${SERVER.HOST}/bot/activate">[ Подтвердить регистрацию ]</a></p>
      `;
};
