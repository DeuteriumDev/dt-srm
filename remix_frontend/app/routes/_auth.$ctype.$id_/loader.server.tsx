import { StatusCodes } from 'http-status-codes';
import { data } from 'react-router';

import { type Route } from '../_auth.$ctype.$id_/+types/route';

import apiRestServer from '~/libs/api.server';
import sessionManager from '~/libs/session.server';

export const handleLoader = async (
  args: Route.LoaderArgs,
  apiRest: typeof apiRestServer,
) => {
  const {
    params: { ctype, id },
  } = args;
  const API_MAP = {
    groups: apiRest.groupsRetrieve,
    users: apiRest.usersRetrieve,
    folders: apiRest.foldersRetrieve,
    documents: apiRest.documentsRetrieve,
  };

  if (!Object.keys(API_MAP).includes(ctype)) {
    throw data(
      { error: `Unsupported ctype: ${ctype}` },
      { status: StatusCodes.FORBIDDEN },
    );
  }

  const result = await API_MAP[ctype as keyof typeof API_MAP]({
    headers: await sessionManager.getAuthHeaders(args.request),
    path: {
      id,
    },
  });

  return data({
    data: result.data,
    lastUpdated: new Date().toISOString(),
  });
};

export default async function loader(args: Route.LoaderArgs) {
  return handleLoader(args, apiRestServer);
}
