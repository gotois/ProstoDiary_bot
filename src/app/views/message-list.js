const { SERVER } = require('../../environment');
/**
 * @param {Array<object>} storyTable - stories
 * @returns {jsonld}
 */
module.exports = (storyTable) => {
  const itemListElement = storyTable.map((story, index) => {
    const listItem = {
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@type': 'Thing',
        'url': `${SERVER.HOST}/message/${story.creator}/${story.id}`,
      },
    };
    return listItem;
  });
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement,
  };
};
