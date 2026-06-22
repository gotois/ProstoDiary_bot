export interface DocumentGateway {
  process(input: { fileId: string }): Promise<{ url: string }>;
}
