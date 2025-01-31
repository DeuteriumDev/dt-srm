import { data } from 'react-router';

import { Button } from '~/components/button';
import api from '~/libs/api.server';
import sessionManager from '~/libs/session.server';

import type { Route } from './+types/route';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Dashboard' },
    { name: 'description', content: 'Graph Table: Dashboard page' },
  ];
}

export async function loader(args: Route.LoaderArgs) {
  const cookie = await sessionManager.getCookie(args.request);
  const foldersRetrieve = await api.foldersRetrieve({
    path: {
      id: args.params.id,
    },
    headers: {
      Authorization: `Bearer ${cookie.get('access_token')}`,
    },
  });
  return data({ foldersRetrieve });
}

export default function Folder(props: Route.ComponentProps) {
  const { loaderData } = props;
  console.log({ loaderData });
  return (
    <div>
      folders
      <Button onClick={console.log}>
        {loaderData?.foldersRetrieve?.data?.name}
      </Button>
    </div>
  );
}
