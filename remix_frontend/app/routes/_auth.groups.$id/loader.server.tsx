import { data } from 'react-router';
import { type Route } from './+types/route';
import { type SearchParams, type LoaderReturn } from './types';

import apiRestServer from '~/libs/api.server';
import { RequestHelper } from '~/libs/request';
import sessionManager from '~/libs/session.server';

const getFormParentId = (searchParams: SearchParams): keyof SearchParams => {
  return searchParams.parent__isnull ? 'parent__isnull' : 'parent__exact';
};

export const handleLoader = async (
  args: Route.LoaderArgs,
  apiRest: typeof apiRestServer,
) => {
  const searchParams = new RequestHelper(
    args.request,
  ).getSearchParams<SearchParams>();
  let groupsRetrieve: LoaderReturn['groupsRetrieve'];
  if (args.params.id === 'new') {
    groupsRetrieve = {
      data: {
        id: undefined,
        name: 'new group',
        parent:
          getFormParentId(searchParams) === 'parent__isnull'
            ? null
            : (searchParams[
                getFormParentId(searchParams)
              ] as SearchParams['parent__exact']),
        description: '',
        favorite: false,
        inherit_permissions:
          getFormParentId(searchParams) === 'parent__exact' ? true : false,
      },
    } as unknown as LoaderReturn['groupsRetrieve'];
  } else {
    groupsRetrieve = await apiRest.groupsRetrieve({
      path: {
        id: args.params.id,
      },
      headers: await sessionManager.getAuthHeaders(args.request),
    });
  }

  const lastUpdated = new Date().toISOString();

  return data({
    groupsRetrieve,
    searchParams,
    lastUpdated,
  });
};

export default async function loader(args: Route.LoaderArgs) {
  return handleLoader(args, apiRestServer);
}
