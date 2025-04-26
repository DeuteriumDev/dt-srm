import {
  type ColumnDef,
  type HeaderContext,
  type CellContext,
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

const iconMap = {
  group: Users,
  user: User,
};

function ActionCell<Data>({ row }: CellContext<Data, unknown>) {
  const item = row.original as apiRest.CustomGroup;
  const { searchParams, toString } = useSearchParams();
  const docType = 'group';
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
        <DropdownMenuItem className="capitalize" asChild>
          <Link
            to={`/${docType}s/members/${item.id}?${RequestHelper.parseSearchParams({ ...searchParams })}`}
          >
            Manage members
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="capitalize" asChild>
          <Link
            to={`/groups/${item.id}/delete?${RequestHelper.parseSearchParams({ ...searchParams })}`}
          >
            {`Delete ${docType}`}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const columns: ColumnDef<apiRest.CustomGroup>[] = [
  {
    accessorKey: 'name',
    header: TableHeader,
    cell: ({ row }) => {
      return (
        <Button variant="ghost" asChild>
          <Link
            className="flex space-x-1 underline"
            to={`/groups?${RequestHelper.parseSearchParams({ parent__exact: row.original.id })}`}
          >
            <Users className="h-5" />
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
    header: TableHeader,
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
    header: TableHeader,
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
    cell: ActionCell,
  },
];

function useGroupsTable() {
  const { data, fetcher } = useData<apiRest.CustomGroup>();
  const { searchParams } = useSearchParams<{ page?: number }>();
  const controller = useReactTable({
    data: data.results,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualFiltering: true,
    manualSorting: true,
    manualPagination: true,
    rowCount: data.count ? data.count : 0,
    state: {
      pagination: {
        pageIndex: searchParams.page ? searchParams.page - 1 : 0,
        pageSize: PAGE_SIZE,
      },
    },
  });
  return { controller, fetcher };
}

export default useGroupsTable;
