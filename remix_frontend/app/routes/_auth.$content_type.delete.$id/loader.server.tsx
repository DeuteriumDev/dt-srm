import _ from 'lodash';
import { data } from 'react-router';
import { type Route } from '../_auth.$content_type.delete.$id/+types/route';

import apiRestServer, { ApiError } from '~/libs/api.server';
import sessionManager from '~/libs/session.server';

export const handleLoader = async (
  args: Route.LoaderArgs,
  apiRest: typeof apiRestServer,
) => {
  const CONTENT_LOADER_MAP = {
    groups: apiRest.groupsRetrieve,
    users: apiRest.usersRetrieve,
    folders: apiRest.foldersRetrieve,
  };
  const {
    params: { content_type, id },
  } = args;

  const getter =
    CONTENT_LOADER_MAP[content_type as keyof typeof CONTENT_LOADER_MAP];

  if (!getter)
    throw data({ error: 'unsupported content_type' }, { status: 400 });
  type ContentData =
    | Awaited<ReturnType<typeof apiRest.groupsRetrieve>>['data']
    | Awaited<ReturnType<typeof apiRest.usersRetrieve>>['data']
    | Awaited<ReturnType<typeof apiRest.foldersRetrieve>>['data'];
  let result:
    | {
        contentData: ContentData;
      }
    | { error: string };
  let status = 204;
  try {
    result = {
      contentData: (
        await getter({
          headers: await sessionManager.getAuthHeaders(args.request),
          path: {
            id,
          },
        })
      ).data,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      try {
        const data = await error.options.json();
        result = { error: data.detail };
        status = error.options.status;
      } catch {
        result = { error: 'server error' };
        status = 500;
      }
    } else {
      result = { error: 'server error' };
      status = 500;
    }
  }
  return data(result, { status });
};

export default async function loader(args: Route.LoaderArgs) {
  return handleLoader(args, apiRestServer);
}
