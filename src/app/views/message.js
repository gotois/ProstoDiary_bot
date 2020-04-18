const dictionary = require('../../lib/dictionary');
const { SERVER } = require('../../environment');

// todo показывать отдельный список для пользователя/бота, и для сторонних людей - https://github.com/gotois/ProstoDiary_bot/issues/280#issuecomment-558048329
module.exports = async (storyTable) => {
  const [action] = storyTable.categories;
  const [context] = storyTable.context;
  const creator = storyTable.creator;

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
    '@context': 'https://schema.org', // hack переопределяю тип для известных словарей
    'object': {
      ...context.object,
      url: `${SERVER.HOST}/thing/${creator}/` + context.object.name,
    },
    'sameAs': synonyms.map((synonym) => {
      return `${SERVER.HOST}/thing/${creator}/` + synonym;
    }),
    '@type': action,
    'agent': [
      {
        identifier: storyTable.version,
        email: storyTable.creator,
      },
      {
        email: storyTable.publisher,
      },
    ],
    'startTime': storyTable.created_at,
    'endTime': storyTable.updated_at,
  };
};
