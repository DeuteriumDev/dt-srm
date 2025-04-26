import {
  type CellContext,
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
import useSearchParams from '~/hooks/use-search-params';
import type apiRest from '~/libs/api.server';
import { RequestHelper } from '~/libs/request';

function TableHeader<Data>({ column }: HeaderContext<Data, unknown>) {
  const { searchParams } = useSearchParams();
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

function ActionCell<Data>({ row }: CellContext<Data, unknown>) {
  const item = row.original as apiRest.CustomUser;
  const { searchParams, toString } = useSearchParams();
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
          <Link to={`/users/${item.id}?${toString()}`}>Edit user</Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="capitalize">Delete user</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const columns: ColumnDef<apiRest.CustomUser>[] = [
  {
    accessorKey: 'email',
    header: TableHeader,
    cell: ({ row }) => (
      <span className="flex items-center space-x-1">
        <AvatarUser user={row.original} />
        <span className="truncate">{row.original?.email}</span>
      </span>
    ),
  },
  {
    accessorKey: 'name',
    header: TableHeader,
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
    header: TableHeader,
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
    cell: ActionCell,
  },
];

function useUsersTable() {
  const { data, fetcher } = useData<apiRest.CustomUser>();
  const { searchParams } = useSearchParams<{ page: number }>();
  const controller = useReactTable({
    data: data.results,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: data.count,
    state: {
      pagination: {
        pageIndex: searchParams.page ? Number(searchParams.page) - 1 : 0,
        pageSize: PAGE_SIZE,
      },
    },
  });
  return { controller, fetcher };
}

export default useUsersTable;
