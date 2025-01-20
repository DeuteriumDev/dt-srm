import { redirect } from 'react-router';
import { client } from '../../codegen/django-rest';
import session from './session.server';
import _ from 'lodash';
import assert from 'assert';

client.setConfig({
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
}

/**
 * Typechecks the oauth response, only have to cast the response one-time after checking
 *
 * @param data {OAuth} - django api oauth resp object
 * @returns {boolean}
 */
function isOauthError(data: OAuth): data is OAuthTokenError {
  return _.has(data, 'error');
}

/**
 * Send given [credentials] to django oauth password flow and init cookie session
 *
 * @param credentials {{ username:string,password:string}}
 * @throws {OAuthError}
 */
export const login = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}): Promise<void> => {
  assert(process.env.BASE_URL, '[BASE_URL] env var required');
  assert(process.env.OAUTH_PATH, '[OAUTH_PATH] env var required');
  assert(process.env.CLIENT_ID, '[CLIENT_ID] env var required');
  assert(process.env.CLIENT_SECRET, '[CLIENT_SECRET] env var required');

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

  if (isOauthError(data)) throw new OAuthError(data);
};

export * from '../../codegen/django-rest';
