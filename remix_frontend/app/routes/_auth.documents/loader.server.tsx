import { data } from 'react-router';

import { type Route } from '../_auth.documents/+types/route';

import { type SearchParams } from './types';
import apiRest from '~/libs/api.server';
import { RequestHelper } from '~/libs/request';
import sessionManager from '~/libs/session.server';

export default async function loader(args: Route.LoaderArgs) {
  const cookie = await sessionManager.getCookie(args.request);
  const searchParams = new RequestHelper(
    args.request,
  ).getSearchParams<SearchParams>();

  const documentsList = await apiRest.documentsList({
    query: searchParams,
    headers: {
      Authorization: `Bearer ${cookie.get(sessionManager.SESSION_access_token)}`,
    },
  });
  // return {Date} to easy switch between data sources without any janky
  // state management
  const lastUpdated = new Date().toISOString();

  return data({
    documentsList,
    searchParams,
    lastUpdated,
  });
}
