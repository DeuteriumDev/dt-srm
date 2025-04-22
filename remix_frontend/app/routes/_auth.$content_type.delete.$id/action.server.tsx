import _ from 'lodash';
import { data } from 'react-router';

import { type Route } from '../_auth.$content_type.delete.$id/+types/route';

import apiRestServer, { ApiError } from '~/libs/api.server';
import { RequestHelper } from '~/libs/request';
import sessionManager from '~/libs/session.server';
import { type ActionResult } from '~/libs/types';

export const handleDelete = async (
  args: Route.ActionArgs,
  apiRest: typeof apiRestServer,
) => {
  let result: ActionResult = { success: true };
  let status: number = 200;
  try {
    const CONTENT_LOADER_MAP = {
      groups: apiRest.groupsDestroy,
      users: apiRest.usersDestroy,
      folders: apiRest.foldersDestroy,
    };
    const deleter =
      CONTENT_LOADER_MAP[
        args.params.content_type as keyof typeof CONTENT_LOADER_MAP
      ];
    if (!deleter)
      throw data({ error: 'Unsupported content_type' }, { status: 400 });

    await deleter({
      headers: await sessionManager.getAuthHeaders(args.request),
      path: {
        id: args.params.id,
      },
    });
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

export default async function action(args: Route.ActionArgs) {
  const apiRest = apiRestServer;
  new RequestHelper(args.request).validateMethods(['DELETE']);
  return await handleDelete(args, apiRest);
}
