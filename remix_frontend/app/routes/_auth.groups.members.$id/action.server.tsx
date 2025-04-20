import { data } from 'react-router';
import { z, ZodError } from 'zod';

import { type Route } from './+types/route';

import apiRestServer, { ApiError } from '~/libs/api.server';
import { RequestHelper } from '~/libs/request';
import sessionManager from '~/libs/session.server';
import { type ActionResult } from '~/libs/types';

export const handlePost = async (
  args: Route.ActionArgs,
  apiRest: typeof apiRestServer,
) => {
  let result: ActionResult;
  let status: number = 200;
  try {
    const json = await args.request.json();
    const parseResult = z
      .object({
        members: z
          .array(z.string())
          .min(1, { message: 'At least one member is required' }),
      })
      .parse(json);
    await apiRest.updateMembers({
      headers: await sessionManager.getAuthHeaders(args.request),
      path: {
        id: args.params.id,
      },
      body: parseResult,
    });
    result = { success: true };
  } catch (error) {
    console.error(error);

    if (error instanceof ZodError) {
      const errorData: Record<string, string> = error.issues.reduce(
        (error, issue) => ({
          ...error,
          [issue.path[0] || 'error']: issue.message,
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
  new RequestHelper(args.request).validateMethods(['PUT']);

  return await handlePost(args, apiRest);
}
