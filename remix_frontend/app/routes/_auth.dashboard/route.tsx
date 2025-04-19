import { Folder } from 'lucide-react';
import { data, Link } from 'react-router';
import { type Route } from '../_auth.dashboard/+types/route';

import {
  Card,
  CardHeader,
  CardDescription,
  CardFooter,
  CardTitle,
} from '~/components/card';
import api from '~/libs/api.server';
import sessionManager from '~/libs/session.server';

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
      favorite: 'true',
    },
    headers: {
      Authorization: `Bearer ${cookie.get(sessionManager.SESSION_access_token)}`,
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
    <div className="flex flex-1 flex-col gap-4 p-8 pt-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        {loaderData.foldersList?.results.map((folder) => (
          <Card key={folder.id} className="flex flex-col justify-between">
            <CardHeader className="pt-6">
              <CardTitle className="flex items-center gap-2">
                <Folder />
                <Link
                  className="underline"
                  to={`/documents?parent__exact=${folder.id}`}
                >
                  {folder.name}
                </Link>
              </CardTitle>
              {folder.description && (
                <CardDescription>{folder.description}</CardDescription>
              )}
            </CardHeader>
            <CardFooter>
              <div className="flex flex-col capitalize">
                {folder.tags.map((t) => (
                  <div key={`${folder.id}-${t}`} className="text-lg">
                    {t.split(':').join(': ')}
                  </div>
                ))}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
