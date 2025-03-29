import type apiRest from '~/libs/api.server';
import { type PageLayout } from '~/libs/types';

export type SearchParams = apiRest.DocumentsListData['query'] & {
  layout: PageLayout;
};
