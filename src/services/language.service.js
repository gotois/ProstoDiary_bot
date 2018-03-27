// const language = require('@google-cloud/language');

// The text to analyze
// const text = 'dollars 100';

// const document = {
//   content: text,
//   type: 'PLAIN_TEXT',
// };

// (async () => {
// return

// Instantiates a client
// const client = new language.LanguageServiceClient();

// const results = await client.analyzeSyntax({document: document})
// const syntax = results[0];

// console.log('Parts of speech:');
// syntax.tokens.forEach(part => {
// console.log(`${part.partOfSpeech.tag}: ${part.text.content}`);
// console.log(`Morphology:`, part.partOfSpeech);
// });

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
// })();
