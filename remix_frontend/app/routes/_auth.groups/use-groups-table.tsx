import {
  type ColumnDef,
  type HeaderContext,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import _ from 'lodash';
import {
  ArrowRight,
  ArrowUpDown,
  MoreHorizontal,
  User,
  Users,
} from 'lucide-react';
import { Link } from 'react-router';

import { type Route } from '../_auth.groups/+types/route';

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

export const columns: ColumnDef<apiRest.CustomGroup>[] = [
  {
    accessorKey: 'name',
    header: tableHeader,
    cell: ({ row }) => {
      const docType = getDocType(row);
      const Icon = iconMap[docType as keyof typeof iconMap];
      return (
        <Button variant="ghost" asChild>
          <Link
            className="flex space-x-1 underline"
            to={`/groups?${RequestHelper.parseSearchParams({ parent__exact: row.original.id })}`}
          >
            <Icon className="h-5" />
            <span className="pl-1">{row.getValue('name')}</span>
          </Link>
        </Button>
      );
    },
  },
  {
    accessorKey: 'member_count',
    header: 'Members',
    cell: ({ row }) => (
      <Button variant="ghost" asChild>
        <Link
          to={`/users?${RequestHelper.parseSearchParams({ groups__id__exact: row.original.id })}`}
          className="italic underline"
        >
          {row.getValue('member_count')}
          <ArrowRight className="h-5" />
        </Link>
      </Button>
    ),
  },
  {
    accessorKey: 'created',
    header: tableHeader,
    cell: ({ row }) => (
      <span>
        {new Intl.DateTimeFormat(globalThis.navigator.language).format(
          new Date(row.getValue('created')),
        )}
      </span>
    ),
  },
  {
    accessorKey: 'updated',
    header: tableHeader,
    cell: ({ row }) => (
      <span>
        {new Intl.DateTimeFormat(globalThis.navigator.language).format(
          new Date(row.getValue('updated')),
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

function useGroupsTable() {
  const { data, fetcher } = useData<Route.ComponentProps['loaderData']>();
  const controller = useReactTable({
    data: data.groupsList.data?.results || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: data.groupsList.data?.count ? data.groupsList.data?.count : 0,
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
    },
  });
  return { controller, fetcher };
}

export default useGroupsTable;
