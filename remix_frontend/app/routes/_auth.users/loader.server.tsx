import { data } from 'react-router';

import { type Route } from '../_auth.groups/+types/route';
import { type SearchParams } from './types';

import apiRestServer from '~/libs/api.server';
import { RequestHelper } from '~/libs/request';
import sessionManager from '~/libs/session.server';

export const handleGet = async (
  args: Route.LoaderArgs,
  apiRest: typeof apiRestServer,
) => {
  const headers = await sessionManager.getAuthHeaders(args.request);
  const searchParams = new RequestHelper(
    args.request,
  ).getSearchParams<SearchParams>();
  const usersList = await apiRest.usersList({
    headers,
    query: searchParams,
  });

  const lastUpdated = new Date().toISOString();
  return data({ usersList, lastUpdated, searchParams }, { status: 200 });
};

export default async function loader(args: Route.LoaderArgs) {
  return await handleGet(args, apiRestServer);
}
