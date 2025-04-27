import type apiRest from '~/libs/api.server';

export type SearchParams = apiRest.DocumentsListData['query'] & {
  layout?: string;
  parent_id?: string;
  groups?: apiRest.GroupsListData['query'];
};

export type LoaderReturn = {
  groupsRetrieve: Awaited<ReturnType<typeof apiRest.groupsRetrieve>>;
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
