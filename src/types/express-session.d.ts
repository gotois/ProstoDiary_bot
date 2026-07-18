import 'express-session';
import type { Session as SolidSession } from '@inrupt/solid-client-authn-node';

declare module 'express-session' {
  interface SessionData {
    code_verifier?: string;
    state?: string;
    is_tma?: boolean;
    authorization_id?: string;
    oauth_pending?: boolean;
    telegram_id?: number;
    token_type?: string;
  }
}

declare global {
  namespace Express {
    interface Request {
      solidSession?: SolidSession;
      user?: {
        id: number;
        actor_id: string | null;
        location: string | null;
        language: string;
        timezone: string | null;
        access_token: string;
        id_token: string | null;
        refresh_token: string | null;
        token_type: string;
        created_at: number;
        expired_at: number | null;
        auth_source: 'bff' | 'tma';
      };
    }
  }
}
