import { createCookieSessionStorage } from 'react-router';

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

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
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

const session = {
  getSession: (request: Request) => {
    console.log('getSession', { request });
    return getSession(request.headers.get('Cookie'));
  },
  commitSession,
  destroySession,
};

export default session;
