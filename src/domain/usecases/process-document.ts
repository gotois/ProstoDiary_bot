import type { DocumentGateway } from '../repositories/document-gateway.ts';

export class ProcessDocument {
  documents: DocumentGateway;

  constructor(documents: DocumentGateway) {
    this.documents = documents;
  }

  execute(input: { fileId: string }): Promise<{ url: string }> {
    return this.documents.process(input);
  }
}
