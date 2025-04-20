import _ from 'lodash';
import { data } from 'react-router';
import { ZodError } from 'zod';

import { type Route } from '../_auth.groups.$id/+types/route';

import apiRestServer, { ApiError } from '~/libs/api.server';
import sessionManager from '~/libs/session.server';
import { type ActionResult } from '~/libs/types';
import validation from '~/libs/validation';
import { RequestHelper } from '~/libs/request';

export const handlePost = async (
  args: Route.ActionArgs,
  apiRest: typeof apiRestServer,
) => {
  const cookie = await sessionManager.getCookie(args.request);
  let result: ActionResult;
  let status: number = 200;
  try {
    const form = await args.request.formData();
    const groupData = {
      name: form.get('name'),
      parent: form.get('parent') === 'null' ? null : form.get('parent'),
      description: form.get('description'),
      hidden: form.get('hidden')?.toString().toLocaleLowerCase() === 'true',
    };
    const parseResult = validation.zCustomGroupRequest.parse(groupData);
    if (args.params.id === 'new') {
      await apiRest.groupsCreate({
        headers: {
          Authorization: `Bearer ${cookie.get(sessionManager.SESSION_access_token)}`,
        },
        body: _.omit(parseResult, 'id'),
      });
    } else {
      await apiRest.groupsPartialUpdate({
        headers: {
          Authorization: `Bearer ${cookie.get(sessionManager.SESSION_access_token)}`,
        },
        path: {
          id: args.params.id,
        },
        body: parseResult,
      });
    }
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
    } else if (error instanceof ApiError) {
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
  new RequestHelper(args.request).validateMethods(['POST']);
  return await handlePost(args, apiRest);
}
