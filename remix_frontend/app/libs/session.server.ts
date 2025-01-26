import { createCookieSessionStorage, type SessionStorage } from 'react-router';

type SessionData = {
  email: string;
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  refresh_token: string;
};

type SessionFlashData = {
  error: string;
};

type SessionGeneric = typeof createCookieSessionStorage<
  SessionData,
  SessionFlashData
>;
class Session {
  cookieSession: SessionStorage<SessionData, SessionFlashData>;
  expiresAt: Date;

  constructor() {
    this.cookieSession = createCookieSessionStorage<
      SessionData,
      SessionFlashData
    >({
      // a Cookie from `createCookie` or the CookieOptions to create one
      cookie: {
        name: '__session',
        // Expires can also be set (although maxAge overrides it when used in combination).
        // Note that this method is NOT recommended as `new Date` creates only one date on each server deployment, not a dynamic date in the future!
        //
        // expires: new Date(Date.now() + 60_000),

        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secrets: process.env.COOKIE_SECRET ? [process.env.COOKIE_SECRET] : [],
        secure: process.env.NODE_ENV !== 'dev',
      },
    });
    this.expiresAt = new Date();
  }

  public async getSession(request: Request) {
    return this.cookieSession.getSession(request.headers.get('Cookie'));
  }

  public async commitSession(
    ...args: Parameters<ReturnType<SessionGeneric>['commitSession']>
  ) {
    this.expiresAt = new Date();
    this.expiresAt.setSeconds(
      this.expiresAt.getSeconds() + (args[0].get('expires_in') || 0),
    );
    return this.cookieSession.commitSession(...args);
  }

  public async destroySession(
    ...args: Parameters<ReturnType<SessionGeneric>['destroySession']>
  ) {
    this.cookieSession.destroySession(...args);
  }
}

// singleton
let session: Session | null = null;
if (!session) {
  session = new Session();
}

export default session as Session;
