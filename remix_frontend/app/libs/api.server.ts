import _ from 'lodash';
import assert from 'assert';

import * as apiRest from '../../codegen/django-rest';
import session from './session.server';
import { redirect } from 'react-router';

apiRest.client.setConfig({
  baseUrl: process.env.BASE_URL,
});

function resolveUrl(from: string, to: string) {
  const resolvedUrl = new URL(to, new URL(from, 'resolve://'));
  if (resolvedUrl.protocol === 'resolve:') {
    // `from` is a relative URL.
    const { pathname, search, hash } = resolvedUrl;
    return pathname + search + hash;
  }
  return resolvedUrl.toString();
}

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
 * @param credentials {LoginArgs}
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

export default apiRest;
