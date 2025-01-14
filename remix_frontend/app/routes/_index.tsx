import type { Route } from './+types/_index';
import { redirect } from 'react-router';

export async function loader(args: Route.LoaderArgs) {
  const isDev = process.env.NODE_ENV;
  console.log(args);
  return redirect('/dashboard', isDev ? 302 : 301);
}
