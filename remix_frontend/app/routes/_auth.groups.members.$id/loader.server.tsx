import { data } from 'react-router';
import { type Route } from './+types/route';
import { type SearchParams } from './types';

import apiRestServer from '~/libs/api.server';
import { RequestHelper } from '~/libs/request';
import sessionManager from '~/libs/session.server';

export const handleLoader = async (
  args: Route.LoaderArgs,
  apiRest: typeof apiRestServer,
) => {
  const searchParams = new RequestHelper(
    args.request,
  ).getSearchParams<SearchParams>();
  const headers = await sessionManager.getAuthHeaders(args.request);
  const groupsRetrieve = await apiRest.groupsRetrieve({
    path: {
      id: args.params.id,
    },
    headers,
  });
  const usersList = await apiRest.usersList({
    headers,
    query: searchParams.users,
  });

  const lastUpdated = new Date().toISOString();

  return data({
    groupsRetrieve,
    searchParams,
    lastUpdated,
    usersList,
  });
};

export default async function loader(args: Route.LoaderArgs) {
  return handleLoader(args, apiRestServer);
}
