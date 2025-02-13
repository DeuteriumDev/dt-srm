import { redirect } from 'react-router';
import { type Route } from '../_auth._index/+types/route';

/**
 * Permanently redirect '<site_root>/' to '<site_root>/dashboard'
 * @param {Route.LoaderArgs} _args
 * @returns {ReturnType<typeof redirect>}
 */
export async function loader(_args: Route.LoaderArgs) {
  const isDev = process.env.NODE_ENV;
  return redirect('/dashboard', isDev ? 302 : 301);
}
