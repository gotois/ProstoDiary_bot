# Утилиты
> Здесь располагаются функции, которые можно выполнять вне полного окружения ProstoDiary

## Пример
```js
require('dotenv').config();
const textToActionJSONLD = require('./src/functions/text-to-jsonld.js');
textToActionJSONLD.then(result => {
  console.log(result);
});
```

