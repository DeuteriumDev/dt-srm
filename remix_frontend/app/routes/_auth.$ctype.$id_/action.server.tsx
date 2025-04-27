import { StatusCodes } from 'http-status-codes';
import { data } from 'react-router';
import { ZodError } from 'zod';

import { type Route } from '../_auth.$ctype.$id_/+types/route';

import apiRestServer, { ApiError } from '~/libs/api.server';
import { RequestHelper } from '~/libs/request';
import sessionManager from '~/libs/session.server';
import { type ActionResult } from '~/libs/types';
import validation from '~/libs/validation';

export const handlePost = async (
  args: Route.ActionArgs,
  apiRest: typeof apiRestServer,
) => {
  const {
    params: { ctype, id },
  } = args;
  let result: ActionResult;
  let status: number = StatusCodes.CREATED;
  const API_MAP = {
    groups: apiRest.groupsPartialUpdate,
    folders: apiRest.foldersPartialUpdate,
  };
  const VALIDATION_MAP = {
    groups: validation.zCustomGroupRequest,
    folders: validation.zFolderRequest,
  };

  if (!Object.keys(API_MAP).includes(ctype)) {
    throw data(
      { error: `Unsupported ctype: ${ctype}` },
      { status: StatusCodes.FORBIDDEN },
    );
  }

  try {
    const data = await args.request.json();
    const parseResult =
      VALIDATION_MAP[ctype as keyof typeof VALIDATION_MAP].parse(data);
    await API_MAP[ctype as keyof typeof API_MAP]({
      headers: await sessionManager.getAuthHeaders(args.request),
      path: {
        id: args.params.id,
      },
      body: parseResult,
    });

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
      status = StatusCodes.UNPROCESSABLE_ENTITY;
    } else if (error instanceof ApiError) {
      try {
        const data = await error.options.json();
        result = { error: data.detail };
        status = error.options.status;
      } catch {
        result = { error: 'server error' };
        status = StatusCodes.INTERNAL_SERVER_ERROR;
      }
    } else {
      result = { error: 'server error' };
      status = StatusCodes.INTERNAL_SERVER_ERROR;
    }
  }
  return data(result, { status });
};

export default async function action(args: Route.ActionArgs) {
  const apiRest = apiRestServer;
  new RequestHelper(args.request).validateMethods(['POST']);
  return await handlePost(args, apiRest);
}
