import {
  type ColumnDef,
  type HeaderContext,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import _ from 'lodash';
import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  User,
  Users,
} from 'lucide-react';
import { Link } from 'react-router';

import { type Route } from '../_auth.users/+types/route';

import { AvatarUser } from '~/components/avatar';
import { Button } from '~/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/dropdown-menu';
import useData, { PAGE_SIZE } from '~/hooks/use-data';
import type apiRest from '~/libs/api.server';
import { RequestHelper } from '~/libs/request';

function tableHeader<Data>({ table, column }: HeaderContext<Data, unknown>) {
  const searchParams = table.options.meta?.searchParams;
  const ordering = (_.get(searchParams, 'ordering') as string) || '';
  return (
    <Button
      variant={ordering.indexOf(column.id) > -1 ? 'default' : 'ghost'}
      asChild
    >
      <Link
        to={`?${RequestHelper.parseSearchParams({
          ...searchParams,
          ordering: ordering === column.id ? `-${column.id}` : column.id,
        })}`}
        className="capitalize"
      >
        {column.id}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Link>
    </Button>
  );
}

const iconMap = {
  group: Users,
  user: User,
};

const getDocType = (row: any): keyof typeof iconMap =>
  _.has(row, 'original.first_name') ? 'user' : 'group';

const columns: ColumnDef<apiRest.CustomUser>[] = [
  {
    accessorKey: 'email',
    header: tableHeader,
    cell: ({ row }) => {
      const fallbackName = `${(row.original?.first_name || 'A').charAt(0)}${(row.original?.last_name || 'A').charAt(0)}`;

      return (
        <span className="flex items-center space-x-1">
          <AvatarUser user={row.original} />

          <span className="truncate">{row.original?.email}</span>
        </span>
      );
    },
  },
  {
    accessorKey: 'name',
    header: tableHeader,
    cell: ({ row }) => (
      <span className="pl-1">{`${row.original.first_name} ${row.original.last_name}`}</span>
    ),
  },
  {
    accessorKey: 'groups',
    header: 'Groups',
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Groups</DropdownMenuLabel>
          {row.original.groups.map((group) => (
            <DropdownMenuItem key={group.id} asChild>
              <Link
                to={`/groups?${RequestHelper.parseSearchParams({
                  groups__id__exact: group.id,
                })}`}
              >
                {group.name}
              </Link>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
  {
    accessorKey: 'date_joined',
    header: tableHeader,
    cell: ({ row }) => (
      <span>
        {new Intl.DateTimeFormat(globalThis.navigator.language).format(
          new Date(row.getValue('date_joined')),
        )}
      </span>
    ),
  },
  {
    id: 'actions',
    size: 50,
    cell: ({ row, table }) => {
      const item = row.original;
      const searchParams = table.options.meta?.searchParams;
      const docType = getDocType(row);
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => globalThis.navigator.clipboard.writeText(item.id)}
            >
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="capitalize" asChild>
              <Link
                to={`/${docType}s/${item.id}?${RequestHelper.parseSearchParams({ ...searchParams })}`}
              >
                {`Edit ${docType}`}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="capitalize">{`Delete ${docType}`}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

function useUsersTable() {
  const { data, fetcher } = useData<Route.ComponentProps['loaderData']>();
  const controller = useReactTable({
    data: data.usersList.data?.results || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: data.usersList.data?.count ? data.usersList.data?.count : 0,
    state: {
      pagination: {
        pageIndex: data.searchParams.page
          ? Number(data.searchParams.page) - 1
          : 0,
        pageSize: PAGE_SIZE,
      },
    },
    meta: {
      searchParams: data.searchParams,
      pagination: {
        next: data.usersList.data?.next,
        count: data.usersList.data?.count,
        previous: data.usersList.data?.previous,
      },
    },
  });
  return { controller, fetcher };
}

export default useUsersTable;
