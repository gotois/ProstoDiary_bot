const { GOOGLE } = require('../env');
const language = require('@google-cloud/language');

const client = new language.LanguageServiceClient({
  credentials: GOOGLE.GOOGLE_CREDENTIALS_PARSED,
});

// TEST
// client
// .analyzeEntitySentiment({document: document})
// .then(results => {
//   const entities = results[0].entities;
//
//   console.log(`Entities and sentiments:`);
//   entities.forEach(entity => {
//     console.log(`  Name: ${entity.name}`);
//     console.log(`  Type: ${entity.type}`);
//     console.log(`  Score: ${entity.sentiment.score}`);
//     console.log(`  Magnitude: ${entity.sentiment.magnitude}`);
//   });
// })
// .catch(err => {
//   console.error('ERROR:', err);
// });

// Detects the sentiment of the document
// client
// .analyzeSentiment({document: document})
// .then(results => {
//   const sentiment = results[0].documentSentiment;
//   console.log(`Document sentiment:`);
//   console.log(`  Score: ${sentiment.score}`);
//   console.log(`  Magnitude: ${sentiment.magnitude}`);
//
//   const sentences = results[0].sentences;
//   sentences.forEach(sentence => {
//     console.log(`Sentence: ${sentence.text.content}`);
//     console.log(`  Score: ${sentence.sentiment.score}`);
//     console.log(`  Magnitude: ${sentence.sentiment.magnitude}`);
//   });
// })
// .catch(err => {
//   console.error('ERROR:', err);
// });

// TESTEND

/**
 * @description The text to analyze
 * @param {string} text - string text
 * @returns {Promise<object>}
 */
const analyzeSyntax = async (text) => {
  const document = {
    content: text,
    type: 'PLAIN_TEXT',
  };
  const [result] = await client.analyzeSyntax({ document });
  return result;
};

module.exports = {
  analyzeSyntax,
};
