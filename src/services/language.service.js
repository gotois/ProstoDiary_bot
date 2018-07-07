/* eslint-disable */
const {GOOGLE_APPLICATION_CREDENTIALS} = require('../env');
const language = require('@google-cloud/language');

if (!GOOGLE_APPLICATION_CREDENTIALS) {
  throw new Error('GOOGLE_APPLICATION_CREDENTIALS not initialized');
}
const GOOGLE_CREDENTIALS = JSON.parse(GOOGLE_APPLICATION_CREDENTIALS);
// Instantiates a client
const client = new language.LanguageServiceClient({
  'credentials': GOOGLE_CREDENTIALS
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

// The text to analyze
const analyze = async (text) => {
  const document = {
    content: text,
    type: 'PLAIN_TEXT',
  };
  
  const results = await client.analyzeSyntax({document: document});
  const syntax = results[0];
  
  console.log('Parts of speech:');
  syntax.tokens.forEach(part => {
    console.log(`${part.partOfSpeech.tag}: ${part.text.content}`);
    console.log(`Morphology:`, part.partOfSpeech);
  });
};

module.exports = {
  'analyze': analyze,
};
