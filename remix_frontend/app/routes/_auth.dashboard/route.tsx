import { data, Link, redirect } from 'react-router';
import { Folder } from 'lucide-react';

import { Button } from '~/components/button';
import api, { refresh } from '~/libs/api.server';
import session from '~/libs/session.server';
import {
  Card,
  CardHeader,
  CardDescription,
  CardFooter,
  CardTitle,
} from '~/components/card';

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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loaderData.foldersList?.results.map((folder) => (
          <Card key={folder.id}>
            <CardHeader className="pt-6">
              <CardTitle className="flex items-center gap-2">
                <Folder />
                <Link className="underline" to={`/folders/${folder.id}`}>
                  {folder.name}
                </Link>
              </CardTitle>
              {folder.description && (
                <CardDescription>{folder.description}</CardDescription>
              )}
            </CardHeader>
            <CardFooter>
              <div className="italic">
                Updated: {new Date(folder.updated).toLocaleString()}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
