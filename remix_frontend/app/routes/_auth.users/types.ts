import type apiRest from '~/libs/api.server';
import { type BaseSearchParams } from '~/libs/request';
import { type PageLayout } from '~/libs/types';

export type SearchParams = apiRest.UsersListData['query'] & {
  layout: PageLayout;
} & BaseSearchParams;
