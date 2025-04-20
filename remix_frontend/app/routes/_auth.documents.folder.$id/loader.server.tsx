import _ from 'lodash';
import { data } from 'react-router';
import { type Route } from './+types/route';
import { type SearchParams, type Crumb, type LoaderReturn } from './types';

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
  const cookie = await sessionManager.getCookie(args.request);
  let foldersRetrieve: LoaderReturn['foldersRetrieve'];
  // let groupsList = {
  //   data: { results: [], count: 0 },
  // } as unknown as LoaderReturn['groupsList'];

  if (args.params.id === 'new') {
    let breadcrumbs: Crumb[] = [];
    if (
      searchParams[getFormParentId(searchParams)] &&
      searchParams[getFormParentId(searchParams)] !== 'null' &&
      searchParams[getFormParentId(searchParams)] !== 'true'
    ) {
      const foldersRetrieve = await apiRest.foldersRetrieve({
        path: {
          id: searchParams[getFormParentId(searchParams)] as string,
        },
        headers: {
          Authorization: `Bearer ${cookie.get(sessionManager.SESSION_access_token)}`,
        },
      });
      const parentFolder = foldersRetrieve.data;
      breadcrumbs = _.concat(parentFolder?.breadcrumbs, [
        parentFolder as unknown as Crumb,
      ]) as Crumb[];
    }
    foldersRetrieve = {
      data: {
        id: undefined,
        name: 'new folder',
        parent:
          getFormParentId(searchParams) === 'parent__isnull'
            ? null
            : (searchParams[
                getFormParentId(searchParams)
              ] as SearchParams['parent__exact']),
        description: '',
        favorite: false,
        breadcrumbs,
        inherit_permissions:
          getFormParentId(searchParams) === 'parent__exact' ? true : false,
      },
    } as unknown as LoaderReturn['foldersRetrieve'];
  } else {
    foldersRetrieve = await apiRest.foldersRetrieve({
      path: {
        id: args.params.id,
      },
      headers: {
        Authorization: `Bearer ${cookie.get(sessionManager.SESSION_access_token)}`,
      },
    });
  }

  // groupsList = await apiRest.groupsList({
  //   query: _.isEmpty(searchParams.groups) ? undefined : searchParams.groups,
  //   headers: {
  //     Authorization: `Bearer ${cookie.get(sessionManager.SESSION_access_token)}`,
  //   },
  // });
  const lastUpdated = new Date().toISOString();

  return data({
    foldersRetrieve,
    searchParams,
    // groupsList,
    lastUpdated,
  });
};

export default async function loader(args: Route.LoaderArgs) {
  return handleLoader(args, apiRestServer);
}
