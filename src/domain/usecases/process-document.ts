import type { DocumentGateway } from '../repositories/document-gateway.ts';

export class ProcessDocument {
  documents: DocumentGateway;

  constructor(documents: DocumentGateway) {
    this.documents = documents;
  }

  async execute(input: { fileId: string }): Promise<{ url: string }> {
    return this.documents.process(input);
  }
}
