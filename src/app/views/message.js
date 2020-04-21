const { getSynonyms } = require('../../lib/dictionary');
const { SERVER } = require('../../environment');

module.exports = async (storyTable) => {
  const [type] = storyTable.categories;
  const [context] = storyTable.context;
  let name = '';
  let sameAs = [];
  if (context) {
    name = context.name;
    if (context.object && context.object.name) {
      name = context.object.name;
    }
    const synonyms = await getSynonyms(name);
    if (synonyms.length > 0) {
      sameAs = synonyms.map((synonym) => {
        return `${SERVER.HOST}/thing/${creator}/` + synonym;
      });
    }
  }

  const creator = storyTable.creator;
  let object = {};
  if (name) {
    object = {
      ...context.object,
      url: `${SERVER.HOST}/thing/${creator}/` + name,
    };
  }
  // субъектом здесь представляется сам user/bot
  return {
    ...context,
    '@context': 'https://schema.org', // hack переопределяю тип для известных словарей
    'object': object,
    sameAs,
    '@type': type,
    'agent': [
      {
        identifier: storyTable.version,
        email: storyTable.creator,
      },
      {
        email: storyTable.publisher,
      },
    ],
    ...{
      // возможно лучше подставлять image если content_type будет позволять
      ['url']: `${SERVER.HOST}/message/${creator}/${storyTable.id}/raw`,
    },
    'startTime': storyTable.created_at,
    'endTime': storyTable.updated_at,
  };
};
