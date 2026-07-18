import {
  buildThing,
  createSolidDataset,
  createThing,
  deleteSolidDataset,
  getSolidDataset,
  getPodUrlAllFrom,
  getProfileAll,
  getStringNoLocale,
  getUrl,
  getThing,
  getThingAll,
  saveSolidDatasetAt,
  setThing,
  solidDatasetAsTurtle,
} from '@inrupt/solid-client';
import { FOAF, RDF } from '@inrupt/vocab-common-rdf';

type Authorization = {
  webId: string;
  fetch: typeof fetch;
};

type Profile = {
  webId: string;
  resourceRootUrl: string;
  email: string | null;
  avatar: string | null;
};

export class SolidGateway {
  async #resourceRoot(authorization: Authorization): Promise<string> {
    try {
      const profile = await getProfileAll(authorization.webId, { fetch: authorization.fetch });
      const podUrl = getPodUrlAllFrom(profile, authorization.webId).at(0);
      if (podUrl) {
        return `${podUrl.replace(/\/?$/, '/')}secretary`;
      }
    } catch (error) {
      console.warn('Unable to discover Pod URL from WebID profile:', error);
    }
    const webId = new URL(authorization.webId);
    return `${webId.toString().replace(/\/$/, '')}/pod/secretary`;
  }

  async #getOrCreate(resourceUrl: string, authorization: Authorization) {
    const authenticatedFetch = authorization.fetch;
    try {
      return await getSolidDataset(resourceUrl, { fetch: authenticatedFetch });
    } catch (error) {
      if (typeof error === 'object' && error && 'statusCode' in error && error.statusCode === 404) {
        return createSolidDataset();
      }
      throw error;
    }
  }

  async initialize(authorization: Authorization): Promise<{ resourceRootUrl: string }> {
    const resourceRootUrl = await this.#resourceRoot(authorization);
    const dataset = await this.#getOrCreate(resourceRootUrl, authorization);
    await saveSolidDatasetAt(resourceRootUrl, dataset, {
      fetch: authorization.fetch,
    });
    return { resourceRootUrl };
  }

  async getProfile(authorization: Authorization): Promise<Profile> {
    const resourceRootUrl = await this.#resourceRoot(authorization);
    const dataset = await this.#getOrCreate(`${resourceRootUrl}/profile`, authorization);
    const profile = getThing(dataset, authorization.webId);
    return {
      webId: authorization.webId,
      resourceRootUrl,
      email: profile ? getStringNoLocale(profile, FOAF.mbox) : null,
      avatar: profile ? getUrl(profile, FOAF.img) : null,
    };
  }

  async updateProfile(
    authorization: Authorization,
    input: { email?: string | null; avatar?: string | null },
  ): Promise<Profile> {
    const resourceRootUrl = await this.#resourceRoot(authorization);
    const resourceUrl = `${resourceRootUrl}/profile`;
    let dataset = await this.#getOrCreate(resourceUrl, authorization);
    const profile = buildThing(createThing({ url: authorization.webId }));
    if (input.email) {
      profile.addStringNoLocale(FOAF.mbox, input.email);
    }
    if (input.avatar) {
      profile.addUrl(FOAF.img, input.avatar);
    }
    dataset = setThing(dataset, profile.build());
    await saveSolidDatasetAt(resourceUrl, dataset, {
      fetch: authorization.fetch,
    });
    return this.getProfile(authorization);
  }

  async listContracts(authorization: Authorization): Promise<string[]> {
    const resourceRootUrl = await this.#resourceRoot(authorization);
    const dataset = await this.#getOrCreate(resourceRootUrl, authorization);
    // TODO Remarks: The first-party Jena Graph Store does not synthesize Solid/LDP containment triples.
    // Contract discovery there requires an explicit containment index or a constrained server-side graph listing API.
    const links: string[] = [];
    for (const thing of getThingAll(dataset)) {
      if (thing.url.startsWith(`${resourceRootUrl}/`) && thing.url.endsWith('.ttl')) {
        links.push(thing.url);
      }
    }
    return links;
  }

  async getContract(authorization: Authorization, name: string): Promise<string> {
    if (!/^[\w-]+\.ttl$/.test(name)) {
      throw new TypeError('Invalid contract resource name');
    }
    const resourceUrl = `${await this.#resourceRoot(authorization)}/${name}`;
    const dataset = await getSolidDataset(resourceUrl, {
      fetch: authorization.fetch,
    });
    return solidDatasetAsTurtle(dataset);
  }

  async deleteContracts(authorization: Authorization): Promise<void> {
    const links = await this.listContracts(authorization);
    await Promise.all(
      links.map((url) => {
        return deleteSolidDataset(url, {
          fetch: authorization.fetch,
        });
      }),
    );
  }

  async updateCalendar(authorization: Authorization, ical: string): Promise<void> {
    const resourceUrl = `${await this.#resourceRoot(authorization)}/events`;
    let dataset = await this.#getOrCreate(resourceUrl, authorization);
    const icalThing = buildThing(createThing({ url: `${resourceUrl}#ical` })).addStringNoLocale(RDF.type, ical);
    dataset = setThing(dataset, icalThing.build());
    await saveSolidDatasetAt(resourceUrl, dataset, {
      fetch: authorization.fetch,
    });
  }
}
