import _ from 'lodash';
import assert from 'assert';

import * as apiRest from '../../codegen/django-rest';
import session from './session.server';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { redirect, type Cookie } from 'react-router';

apiRest.client.setConfig({
  baseUrl: process.env.BASE_URL,
});

/**
 * Convert current url to new url preserving other options, eg 'localhost:123/here' -> 'localhost:123/now'
 * @param from - full url to start from
 * @param to - partial url to end at
 * @returns finalUrl {string}
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

export class OAuthError extends Error {
  constructor(data: OAuthTokenError) {
    super();
    this.message = data.error_description;
  }

  /**
   * Typechecks the oauth response, only have to cast the response one-time after checking
   *
   * @param data {OAuth} - django api oauth resp object
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

/**
 * Authenticate user and redirect to given url
 *
 * @param {LoginArgs} credentials
 * @throws {OAuthError}
 */
export const login = async ({
  username,
  password,
  request,
  redirectTo,
}: LoginArgs) => {
  assert(process.env.BASE_URL, '[BASE_URL] env var required');
  assert(process.env.OAUTH_PATH, '[OAUTH_PATH] env var required');
  assert(process.env.CLIENT_ID, '[CLIENT_ID] env var required');
  assert(process.env.CLIENT_SECRET, '[CLIENT_SECRET] env var required');

  try {
    const resp = await fetch(
      resolveUrl(process.env.BASE_URL, process.env.OAUTH_PATH),
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

    const cookie = await session.getSession(request);
    cookie.set('email', username);
    cookie.set('access_token', data.access_token);
    cookie.set('expires_in', data.expires_in);
    cookie.set('refresh_token', data.refresh_token);
    cookie.set('scope', data.scope);
    cookie.set('token_type', data.token_type);

    return redirect(redirectTo, {
      headers: {
        'Set-Cookie': await session.commitSession(cookie),
      },
    });
  } catch (error) {
    if (error instanceof OAuthError) throw error;

    console.log(error);
    throw new Error('Login method failed');
  }
};

/**
 * Refresh current session, but doesn't commit new values
 *
 * @param {{request}} args -  args object containing the Remix request object
 * @returns {Cookie} updatedSession
 * @throws {OAuthError}
 */
export const refresh = async ({ request }: { request: Request }) => {
  assert(process.env.BASE_URL, '[BASE_URL] env var required');
  assert(process.env.OAUTH_PATH, '[OAUTH_PATH] env var required');
  assert(process.env.CLIENT_ID, '[CLIENT_ID] env var required');
  assert(process.env.CLIENT_SECRET, '[CLIENT_SECRET] env var required');

  try {
    const oldSession = await session.getSession(request);
    const refreshToken = oldSession.get('refresh_token') || '';

    const req = {
      method: 'post',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        refresh_token: refreshToken,
      }),
    };
    const url = resolveUrl(process.env.BASE_URL, process.env.OAUTH_PATH);
    const resp = await fetch(url, req);
    const data = (await resp.json()) as OAuth;
    console.log('refreshData', { data, refreshToken, req, url });
    if (OAuthError.isOauthError(data)) throw new OAuthError(data);

    oldSession.set('access_token', data.access_token);
    oldSession.set('refresh_token', data.refresh_token);
    oldSession.set('expires_in', data.expires_in);

    return oldSession;
  } catch (error) {
    if (error instanceof OAuthError) throw error;

    console.log(error);
    throw new Error('Refresh method failed');
  }
};

export default apiRest;
