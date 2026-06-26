import type { Request, Response, NextFunction } from 'express';
import { verifyCredential } from '@digitalbazaar/vc';
import { Ed25519Signature2020 } from '@digitalbazaar/ed25519-signature-2020';
import { Ed25519VerificationKey2020 } from '@digitalbazaar/ed25519-verification-key-2020';
import { createDocumentLoader } from '../helpers/loader.ts';

/**
 * @description Верификация подписанного документа (Verifiable Credential)
 * @param {Request} request - request
 * @param {Response} response - response
 * @param {NextFunction} next - next
 * @returns {Promise<void>} Результат проверки credential
 */
export default async function (request: Request, response: Response, next: NextFunction): Promise<void> {
  if (!request?.body) {
    return next(new Error('Invalid credential format'));
  }
  if (!request.body?.proof) {
    return next(new Error('Credential must have a proof'));
  }
  if (!request.body?.issuer) {
    return next(new Error('Credential must have an issuer'));
  }
  try {
    const responseActor = await fetch(request.body.id);
    if (!responseActor.ok) {
      return next(new Error('Actor Fetching Failed'));
    }
    const exportKeys = await responseActor.json();
    const key = await Ed25519VerificationKey2020.from(exportKeys);

    const result = await verifyCredential({
      credential: request.body,
      suite: new Ed25519Signature2020({ key }),
      documentLoader: createDocumentLoader(key),
    });

    if (!result.verified) {
      return next(result.error);
    }
    next();
  } catch (error) {
    return next(error);
  }
}
