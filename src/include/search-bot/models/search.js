const jsonld = require('jsonld');
const query = require('../services/query');
const upload = require('../services/upload');
const crawler = require('../services/crawler');

module.exports = class Search {
  constructor(auth) {
    this.auth = auth;
    this.urls = new Set();
    this.documents = new Set();
  }

  async setUrls(document) {
    const flattened = await jsonld.flatten(document);
    flattened
      .filter((rdf) => {
        return rdf['http://schema.org/url'] !== undefined;
      })
      .map((rdf) => {
        return rdf['http://schema.org/url'][0]['@id'];
      })
      .forEach((url) => {
        if (url.startsWith('https://')) {
          this.urls.add(url);
        }
      });
  }

  async sniff(url) {
    const document = await crawler(url, this.auth);
    this.documents.add(document);
    await this.setUrls(document);

    return document;
  }

  async sniffAll() {
    for (const url of [...this.urls]) {
      await this.sniff(url);
    }
  }

  async upload(document) {
    // переопределяем контекст для правильного распознавания JENA
    if (document['@context'] == 'https://schema.org') {
      document['@context'] = 'https://schema.org/docs/jsonldcontext.json';
    }

    const string = JSON.stringify(document, null, 2);
    // console.log('upload', string);
    const bufferObject = Buffer.from(string);
    await upload(bufferObject);
  }

  async uploadAll() {
    for (const document of [...this.documents]) {
      if (document['@type'].endsWith('Action')) {
        await this.upload(document);
        // console.log('upload success');
      }
    }
  }

  async query(sparqlQuery) {
    const { results } = await query(sparqlQuery);
    return results;
  }
};
