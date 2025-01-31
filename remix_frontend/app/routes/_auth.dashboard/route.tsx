import { data, Link } from 'react-router';
import { Folder } from 'lucide-react';

import api from '~/libs/api.server';
import sessionManager from '~/libs/session.server';
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
  const cookie = await sessionManager.getCookie(args.request);
  const folders = await api.foldersList({
    query: {
      favorite: true,
    },
    headers: {
      Authorization: `Bearer ${cookie.get('access_token')}`,
    },
  });

  // console.log({ folders, sessionManager, now: new Date() });
  return data({
    foldersList: folders.data,
  });
}

export default function Dashboard(props: Route.ComponentProps) {
  const { loaderData } = props;
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        {loaderData.foldersList?.results.map((folder) => (
          <Card key={folder.id}>
            <CardHeader className="pt-6">
              <CardTitle className="flex items-center gap-2">
                <Folder />
                <Link
                  className="underline"
                  to={`/documents/folders/${folder.id}`}
                >
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
