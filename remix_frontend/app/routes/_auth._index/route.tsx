import type { Route } from '../_auth._index/+types/route';
import { redirect } from 'react-router';

export async function loader(_args: Route.LoaderArgs) {
  const isDev = process.env.NODE_ENV;
  return redirect('/dashboard', isDev ? 302 : 301);
}
