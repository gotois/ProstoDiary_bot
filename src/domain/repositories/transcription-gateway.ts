export interface TranscriptionGateway {
  transcribe(input: { fileId: string }): Promise<string>;
}
