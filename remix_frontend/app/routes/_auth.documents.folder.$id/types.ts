import type apiRest from '~/libs/api.server';
import { type ArrayElement } from '~/libs/types';

export type Crumb = ArrayElement<apiRest.Folder['breadcrumbs']>;

export type SearchParams = apiRest.DocumentsListData['query'] & {
  layout?: string;
  parent_id?: string;
  groups?: apiRest.GroupsListData['query'];
};

export type LoaderReturn = {
  foldersRetrieve: Awaited<ReturnType<typeof apiRest.foldersRetrieve>>;
  groupsList: Awaited<ReturnType<typeof apiRest.groupsList>>;
  searchParams: SearchParams;
  lastUpdated: string;
};

export type ActionResult =
  | Partial<Record<keyof apiRest.FolderRequest, string>>
  | { success: true }
  | { error: string };

export type PermissionGroup = {
  id: string;
  name: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
  object_id: string;
};
