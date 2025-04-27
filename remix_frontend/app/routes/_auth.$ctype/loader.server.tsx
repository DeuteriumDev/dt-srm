import { StatusCodes } from 'http-status-codes';
import { data } from 'react-router';

import { type Route } from '../_auth.$ctype/+types/route';
import { type SearchParams } from './types';

import apiRestServer from '~/libs/api.server';
import { RequestHelper } from '~/libs/request';
import sessionManager from '~/libs/session.server';

export const handleGet = async (
  args: Route.LoaderArgs,
  apiRest: typeof apiRestServer,
) => {
  const {
    params: { ctype },
  } = args;
  const searchParams = new RequestHelper(
    args.request,
  ).getSearchParams<SearchParams>();

  const API_MAP = {
    groups: apiRest.groupsList,
    users: apiRest.usersList,
    documents: apiRest.documentsList,
    folders: apiRest.foldersList,
    test: apiRest.groupsList,
  };

  if (!Object.keys(API_MAP).includes(ctype)) {
    throw data(
      { error: `Unsupported ctype: ${ctype}` },
      { status: StatusCodes.FORBIDDEN },
    );
  }

  const resultsList = await API_MAP[args.params.ctype as keyof typeof API_MAP]({
    headers: await sessionManager.getAuthHeaders(args.request),
    query: searchParams,
  });

  const lastUpdated = new Date().toISOString();
  return data({ data: resultsList.data, lastUpdated }, { status: 200 });
};

export default async function loader(args: Route.LoaderArgs) {
  return await handleGet(args, apiRestServer);
}
