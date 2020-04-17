const dictionary = require('../../lib/dictionary');

// todo показывать отдельный список для пользователя/бота, и для сторонних людей - https://github.com/gotois/ProstoDiary_bot/issues/280#issuecomment-558048329
module.exports = async (storyTable) => {
  const [action] = storyTable.categories;
  const [context] = storyTable.context;
  // const content = storyTable.content.toString();

  const synonyms = [];
  const { def } = await dictionary({
    text: context.object.name,
    lang: 'ru-ru',
  });
  if (Array.isArray(def)) {
    for (const d of def) {
      synonyms.push(d.tr[0].text);
      if (Array.isArray(d.tr[0].syn)) {
        d.tr[0].syn.forEach((syn) => {
          synonyms.push(syn.text);
        });
      }
    }
  }
  // субъектом здесь представляется сам user
  return {
    ...context,
    'object': {
      ...context.object,
      // todo брать данные юзера
      url: 'https://gotointeractive.com/user/' + context.object.name,
    },
    'sameAs': synonyms.map((synonym) => {
      return 'https://gotointeractive.com/user/' + synonym;
    }),
    '@type': action,
    'agent': {
      identifier: storyTable.version,
      email: storyTable.publisher_email,
    },
    'startTime': storyTable.created_at,
    'endTime': storyTable.updated_at,
  };
};
