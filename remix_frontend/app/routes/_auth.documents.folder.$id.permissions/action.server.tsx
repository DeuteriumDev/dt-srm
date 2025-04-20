import _ from 'lodash';
import { data } from 'react-router';
import { ZodError } from 'zod';

import { type PermissionGroup } from '../_auth.documents.folder.$id/types';
import { type Route } from './+types/route';

import apiRestServer from '~/libs/api.server';
import sessionManager from '~/libs/session.server';
import { type ActionResult } from '~/libs/types';
import validation from '~/libs/validation';

export const handlePost = async (
  args: Route.ActionArgs,
  apiRest: typeof apiRestServer,
) => {
  const cookie = await sessionManager.getCookie(args.request);
  let result: ActionResult;
  let status: number = 200;
  try {
    const data = (await args.request.json()) as PermissionGroup[];
    await Promise.all(
      data.map((pg) =>
        apiRest.permissionsCreate({
          headers: {
            Authorization: `Bearer ${cookie.get(sessionManager.SESSION_access_token)}`,
          },
          body: validation.zCustomPermissionsRequest.parse({
            group_id: pg.id as string,
            object_id: args.params.id as string,
            can_create: pg.can_create,
            can_read: pg.can_read,
            can_update: pg.can_update,
            can_delete: pg.can_delete,
            ctype: 24,
          }) as apiRestServer.CustomPermissionsRequest,
        }),
      ),
    );
    result = { success: true };
  } catch (error) {
    if (error instanceof ZodError) {
      const errorData: Record<string, string> = error.issues.reduce(
        (error, issue) => ({
          ...error,
          [issue.path[0]]: issue.message,
        }),
        {},
      );
      result = errorData;
      status = 400;
    } else {
      result = { error: 'server error' };
      console.error(result, error);
      status = 500;
    }
  }
  return data(result, { status });
};

export default async function action(args: Route.ActionArgs) {
  const apiRest = apiRestServer;
  console.log('permissions');
  return await handlePost(args, apiRest);
}
