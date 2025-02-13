import { Folder } from 'lucide-react';
import { data, Link } from 'react-router';
import { type Route } from '../_auth.dashboard/+types/route';

import {
  Card,
  CardHeader,
  CardDescription,
  CardFooter,
  CardTitle,
  CardContent,
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
                  to={`/documents?parent__exact=${folder.id}`}
                >
                  {folder.name}
                </Link>
              </CardTitle>
              {folder.description && (
                <CardDescription>{folder.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-lg">Items: {folder.children_count}</p>
            </CardContent>
            {/* <CardFooter>
              <div className="text-sm italic">
                {`Updated: ${new Intl.DateTimeFormat(navigator.language).format(
                  new Date(folder.updated),
                )}`}
              </div>
            </CardFooter> */}
          </Card>
        ))}
      </div>
    </div>
  );
}
