import { data } from 'react-router';

import { Button } from '~/components/button';
import sessionManager from '~/libs/session.server';

import type { Route } from './+types/route';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Dashboard' },
    { name: 'description', content: 'Graph Table: Dashboard page' },
  ];
}

export async function loader(args: Route.LoaderArgs) {
  await sessionManager.getCookie(args.request);
  return data({});
}

export default function Dashboard(_props: Route.ComponentProps) {
  return (
    <div>
      <Button onClick={console.log}>docs</Button>
    </div>
  );
}
