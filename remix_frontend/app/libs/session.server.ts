import assert from 'assert';
import _ from 'lodash';
import {
  createCookieSessionStorage,
  redirect,
  type Session,
  type SessionStorage,
} from 'react-router';

/**
 * Convert current url to new url preserving other options, eg 'localhost:123/here' -> 'localhost:123/now'
 * @param {string} from - full url to start from
 * @param {string} to - partial url to end at
 * @returns {string}
 */
const resolveUrl = (from: string, to: string) => {
  const resolvedUrl = new URL(to, new URL(from, 'resolve://'));
  if (resolvedUrl.protocol === 'resolve:') {
    // `from` is a relative URL.
    const { pathname, search, hash } = resolvedUrl;
    return pathname + search + hash;
  }
  return resolvedUrl.toString();
};
interface OAuthTokenSuccess {
  access_token: string;
  expires_in: number;
  token_type: 'Bearer';
  scope: 'read write';
  refresh_token: string;
}
interface OAuthTokenError {
  error: string;
  error_description: string;
}

type OAuth = OAuthTokenSuccess | OAuthTokenError;

class OAuthError extends Error {
  constructor(data: OAuthTokenError) {
    super();
    this.message = data.error_description;
  }

  /**
   * Typechecks the oauth response, only have to cast the response one-time after checking
   *
   * @param {OAuth} data - django api oauth resp object
   * @returns {boolean}
   */
  public static isOauthError(data: unknown): data is OAuthTokenError {
    return _.has(data, 'error');
  }
}

interface LoginArgs {
  username: string;
  password: string;
  request: Request;
  redirectTo: string;
}

type SessionData = {
  email: string;
  access_token: string;
  expires_at: string;
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

type SessionHeaderFunction = () => ResponseInit | undefined;

// 1/4 through session (aka 8 days), refresh token
const SESSION_TIMEOUT_OFFSET =
  parseInt(process.env.ACCESS_TOKEN_EXPIRE_SECONDS || '0') / 4;

export class SessionManager {
  cookieSession: SessionStorage<SessionData, SessionFlashData>;
  OAuthError: typeof OAuthError;

  SESSION_access_token: keyof SessionData = 'access_token';
  SESSION_email: keyof SessionData = 'email';
  SESSION_expires_at: keyof SessionData = 'expires_at';
  SESSION_refresh_token: keyof SessionData = 'refresh_token';

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
    this.OAuthError = OAuthError;
  }

  /**
   * Tiny helper to parse cookie *directly* from request, rather than a
   * request property
   * @param {Request} request
   * @returns {Session<SessionData, SessionFlashData>}
   */
  private async getSession(request: Request) {
    return this.cookieSession.getSession(request.headers.get('Cookie'));
  }

  /**
   * Checks wether the current session is within the desired timespan to refresh
   * without interrupting the user
   * @param {Session<SessionData, SessionFlashData>} cookie - session auth cookie
   * @returns {boolean}
   */
  private shouldRefreshCookie(
    cookie: Session<SessionData, SessionFlashData>,
  ): boolean {
    const sessionTimeout = new Date(
      Date.parse(cookie.get(this.SESSION_expires_at) || ''),
    );

    const sessionOffsetTimeout = new Date(sessionTimeout);
    sessionOffsetTimeout.setSeconds(
      sessionOffsetTimeout.getSeconds() - SESSION_TIMEOUT_OFFSET,
    );
    const now = new Date();
    return sessionTimeout >= now && now >= sessionOffsetTimeout;
  }

  /**
   * Checks wether the current session has overrun the expiration, rather than
   * just the "desired" timespan. If so, we'll need to interrupt the user.
   * @param {Session<SessionData, SessionFlashData>} cookie - session auth cookie
   * @returns {boolean}
   */
  private shouldResetCookie(
    cookie: Session<SessionData, SessionFlashData>,
  ): boolean {
    const sessionTimeout = new Date(
      Date.parse(cookie.get(this.SESSION_expires_at) || ''),
    );
    const now = new Date();
    return sessionTimeout <= now;
  }
  /**
   * Retrieve session cookie, and optionally refresh the token. Refreshes the
   * token *before* it expires because sub routes will use it, and I can't
   * manage the race condition when 2 threads try and fresh the same token.
   *
   * If past the refresh zone, throw a redirect because it's too late and any
   * sub pages will throw OAuth errors.
   *
   * When calling, make sure to use the {SessionHeaderFunction} in the response
   * data. EG:
   * ```
   * const [getHeaders, cookie] = await sessionManager.getOrRefreshCookie(
   *   args.request,
   * );
   *
   * // ... loader function stuff
   *
   * return data(
   *   loaderData,
   *   getHeaders(), // <-- important
   * );
   *
   * ```
   *
   * @param {Request} request - loader or action [request]
   * @returns {[SessionHeaderFunction, Session<SessionData, SessionFlashData>]}
   * @throws {RequestRedirect}
   */
  public async getOrRefreshCookie(
    request: Request,
  ): Promise<[SessionHeaderFunction, Session<SessionData, SessionFlashData>]> {
    let cookie = await this.getSession(request);
    if (!cookie.has(this.SESSION_access_token)) {
      throw redirect(`/login?redirect=/dashboard`);
    } else if (this.shouldRefreshCookie(cookie)) {
      cookie = await this.refresh(request);
      const newCookie = await this.commitSession(cookie);
      return [() => ({ headers: { 'Set-Cookie': newCookie } }), cookie];
    } else if (this.shouldResetCookie(cookie)) {
      cookie = await this.refresh(request);
      const newCookie = await this.commitSession(cookie);
      throw redirect(request.url, { headers: { 'Set-Cookie': newCookie } });
    }

    return [() => undefined, cookie];
  }

  /**
   * Parses a Cookie header from a HTTP request and returns the associated
   * Session. If there is no session associated with the cookie, this will
   * return a new Session with no data.
   * @param {Request} request
   * @returns {Session<SessionData, SessionFlashData>}
   * @throws {RequestRedirect}
   */
  public async getCookie(request: Request) {
    const cookie = await this.getSession(request);
    if (!cookie.has(this.SESSION_access_token))
      throw redirect(`/login?redirect=/dashboard`);
    return cookie;
  }

  /**
   * Refresh current session, but doesn't commit new values
   *
   * @param {RefreshArgs} args -  args object containing the Remix request object
   * @returns {Cookie} updatedSession
   * @throws {OAuthError}
   */
  private async refresh(request: Request) {
    assert(process.env.OAUTH_URL, '[OAUTH_URL] env var required');
    assert(process.env.OAUTH_TOKEN_PATH, '[OAUTH_TOKEN_PATH] env var required');
    assert(process.env.CLIENT_ID, '[CLIENT_ID] env var required');
    assert(process.env.CLIENT_SECRET, '[CLIENT_SECRET] env var required');

    try {
      const oldSession = await this.getSession(request);
      const refreshToken = oldSession.get(this.SESSION_refresh_token) || '';

      const req = {
        method: 'post',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: this.SESSION_refresh_token,
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          refresh_token: refreshToken,
        }),
      };
      const url = resolveUrl(
        process.env.OAUTH_URL,
        process.env.OAUTH_TOKEN_PATH,
      );
      const resp = await fetch(url, req);
      const data = (await resp.json()) as OAuth;
      if (OAuthError.isOauthError(data)) throw new OAuthError(data);

      const now = new Date();
      now.setSeconds(now.getSeconds() + data.expires_in);

      oldSession.set(this.SESSION_access_token, data.access_token);
      oldSession.set(this.SESSION_refresh_token, data.refresh_token);
      oldSession.set(this.SESSION_expires_at, now.toISOString());

      return oldSession;
    } catch (error) {
      if (error instanceof OAuthError) {
        throw redirect(`/login?redirect=${new URL(request.url).pathname}`);
      }

      throw new Error('Refresh method failed');
    }
  }

  /**
   * Authenticate user and redirect to given url
   *
   * @param {LoginArgs} credentials
   * @throws {OAuthError}
   */
  public async login({ username, password, request, redirectTo }: LoginArgs) {
    assert(process.env.OAUTH_URL, '[OAUTH_URL] env var required');
    assert(process.env.OAUTH_TOKEN_PATH, '[OAUTH_TOKEN_PATH] env var required');
    assert(process.env.CLIENT_ID, '[CLIENT_ID] env var required');
    assert(process.env.CLIENT_SECRET, '[CLIENT_SECRET] env var required');

    try {
      const resp = await fetch(
        resolveUrl(process.env.OAUTH_URL, process.env.OAUTH_TOKEN_PATH),
        {
          method: 'post',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'password',
            username,
            password,
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
          }),
        },
      );
      const data = (await resp.json()) as OAuth;
      if (OAuthError.isOauthError(data)) throw new OAuthError(data);

      const cookie = await this.getSession(request);
      const now = new Date();
      now.setSeconds(now.getSeconds() + data.expires_in);
      cookie.set('email', username);
      cookie.set(this.SESSION_access_token, data.access_token);
      cookie.set(this.SESSION_expires_at, now.toISOString());
      cookie.set(this.SESSION_refresh_token, data.refresh_token);
      cookie.set('scope', data.scope);
      cookie.set('token_type', data.token_type);

      return redirect(redirectTo, {
        headers: {
          'Set-Cookie': await this.commitSession(cookie),
        },
      });
    } catch (error) {
      if (error instanceof OAuthError) throw error;

      throw new Error('Login method failed');
    }
  }

  /**
   * Logout the current user and redirect them to the login page
   * @param {Request} request - router request object
   * @returns {Promise}
   */
  public async logout(request: Request) {
    assert(process.env.OAUTH_URL, '[OAUTH_URL] env var required');
    assert(
      process.env.OAUTH_REVOKE_PATH,
      '[OAUTH_TOKEN_PATH] env var required',
    );
    assert(process.env.CLIENT_ID, '[CLIENT_ID] env var required');
    assert(process.env.CLIENT_SECRET, '[CLIENT_SECRET] env var required');
    const cookie = await this.getCookie(request);
    const access_token = cookie.get(this.SESSION_access_token);

    try {
      if (!access_token) throw new Error('Session without access token');

      await fetch(
        resolveUrl(process.env.OAUTH_URL, process.env.OAUTH_REVOKE_PATH),
        {
          method: 'post',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            token: access_token,
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
          }),
        },
      );
    } catch (error) {
      console.error({ error });
    } finally {
      throw redirect('/login', {
        headers: {
          'Set-Cookie': await this.destroySession(cookie),
        },
      });
    }
  }

  /**
   * Stores all data in the Session and returns the Set-Cookie header to be used in the HTTP response.
   * @param {Parameters<ReturnType<SessionGeneric>['commitSession']>} args
   * @returns {Promise<string>}
   */
  private async commitSession(
    ...args: Parameters<ReturnType<SessionGeneric>['commitSession']>
  ) {
    return await this.cookieSession.commitSession(...args);
  }

  /**
   * Deletes all data associated with the Session and returns the Set-Cookie header to be used in the HTTP response.
   * @param {Parameters<ReturnType<SessionGeneric>['destroySession']>} args
   * @returns {Promise<string>}
   */
  public async destroySession(
    ...args: Parameters<ReturnType<SessionGeneric>['destroySession']>
  ) {
    return await this.cookieSession.destroySession(...args);
  }

  public revalidateSession(
    request: Request,
    error?: Record<'detail', string>,
  ): void {
    throw redirect(
      `/login?redirect=${new URL(request.url).pathname}${error?.detail ? `&error=${error?.detail}` : ''}`,
    );
  }
}

// singleton
let sessionManager: SessionManager | null = null;
if (!sessionManager) {
  // console.log('new session');
  sessionManager = new SessionManager();
}

export default sessionManager as SessionManager;
