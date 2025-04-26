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
  const groupsList = await apiRest.groupsList({
    headers,
    query: searchParams,
  });

  const lastUpdated = new Date().toISOString();
  return data({ data: groupsList.data, lastUpdated }, { status: 200 });
};

export default async function loader(args: Route.LoaderArgs) {
  return await handleGet(args, apiRestServer);
}
