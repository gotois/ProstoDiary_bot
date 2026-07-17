import 'express-session';

declare module 'express-session' {
  interface SessionData {
    code_verifier?: string;
    state?: string;
    telegram_id?: number;
    token_type?: string;
  }
}

declare global {
  namespace Express {
    interface Request {
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
      };
    }
  }
}
