import { data, redirect } from 'react-router';

import Button from '~/components/Button';
import api, { refresh } from '~/libs/api.server';
import session from '~/libs/session.server';

import type { Route } from '../_auth.dashboard/+types/route';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Dashboard' },
    { name: 'description', content: 'Graph Table: Dashboard page' },
  ];
}

export async function loader(args: Route.LoaderArgs) {
  let cookie = await session.getSession(args.request);
  if (!cookie.has('access_token')) throw redirect(`/login?redirect=/dashboard`);
  if (session.expiresAt <= new Date()) {
    cookie = await refresh({ request: args.request });
  }
  const me = await api.usersMeRetrieve({
    headers: {
      Authorization: `Bearer ${cookie.get('access_token')}`,
    },
  });
  const folders = await api.foldersList({
    query: {
      favorite: true,
    },
    headers: {
      Authorization: `Bearer ${cookie.get('access_token')}`,
    },
  });
  return data(
    { usersMeRetrieve: me.data, foldersList: folders.data },
    {
      headers: {
        'Set-Cookie': await session.commitSession(cookie),
      },
    },
  );
}

export default function Dashboard(props: Route.ComponentProps) {
  const { loaderData } = props;
  return (
    <div>
      dashboard
      <Button onClick={console.log}>
        {loaderData?.usersMeRetrieve?.email}
      </Button>
      <ul>
        {loaderData.foldersList?.results.map((folder) => (
          <li key={folder.id}>{folder.name}</li>
        ))}
      </ul>
    </div>
  );
}
