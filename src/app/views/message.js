const googleKnowledgeGraph = require('../../lib/google-knowledge-graph');
const { getSynonyms } = require('../../lib/dictionary');
const { SERVER } = require('../../environment');

module.exports = async (storyTable) => {
  const [type] = storyTable.categories;
  const [context] = storyTable.context;
  let name = '';
  let sameAs = [];
  const creator = storyTable.creator;
  let description = null;
  let url = null;
  let image = null;
  let object = {};

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
  if (name) {
    // насыщаем открытыми данными
    const gkgData = await googleKnowledgeGraph.query(name);
    if (gkgData.itemListElement.length > 0) {
      description = gkgData.itemListElement[0].result.description;
      url = gkgData.itemListElement[0].result.url;
      image = {
        '@type': 'ImageObject',
        ...gkgData.itemListElement[0].result.image,
      };
    }
    object = {
      '@type': 'Thing',
      ...context.object,
      'url': `${SERVER.HOST}/thing/${creator}/` + name,
    };
  }
  // субъектом здесь представляется сам user/bot
  return {
    ...context,
    '@context': 'https://schema.org', // hack переопределяю тип для известных словарей
    'object': object,
    sameAs,
    description,
    image,
    '@type': type,
    'agent': [
      {
        '@type': 'Organization',
        'identifier': storyTable.version,
        'email': storyTable.creator,
      },
      {
        '@type': 'Organization',
        'email': storyTable.publisher,
      },
    ],
    url,
    'startTime': storyTable.created_at,
    'endTime': storyTable.updated_at,
  };
};
