import {
  type ColumnDef,
  type HeaderContext,
  type RowData,
} from '@tanstack/react-table';
import _ from 'lodash';
import {
  ArrowUpDown,
  FileBadge,
  FileQuestion,
  Folder,
  MoreHorizontal,
} from 'lucide-react';
import { Link } from 'react-router';

import { Badge } from '~/components/badge';
import { Button } from '~/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/dropdown-menu';
import type apiRest from '~/libs/api.server';
import { RequestHelper } from '~/libs/request';
import { type IconNode, type Document, type ArrayElement } from '~/libs/types';

declare module '@tanstack/table-core' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    searchParams?: apiRest.DocumentsListData['query'] & {};
    pagination?: {
      next: number | null | undefined;
      previous: number | null | undefined;
      count: number | undefined;
    };
  }
}

function tableHeader<Data>({ table, column }: HeaderContext<Data, unknown>) {
  const searchParams = table.options.meta?.searchParams;
  const ordering = _.get(searchParams, 'ordering', '');
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

const columnsIcons: Record<Document['resourcetype'], IconNode> = {
  Folder: Folder,
  Invoice: FileBadge,
  Kit: FileBadge,
};

const columns: ColumnDef<Document>[] = [
  {
    accessorKey: 'name',
    header: tableHeader,
    cell: ({ row, table }) => {
      const searchParams = table.options.meta?.searchParams;
      const document = row.original;
      const Icon = columnsIcons[document.resourcetype] || FileQuestion;

      if (document.resourcetype === 'Folder') {
        return (
          <Link
            className="cur flex space-x-1 font-medium underline"
            to={`/documents?${RequestHelper.parseSearchParams({
              ..._.omit(searchParams, 'parent__isnull'),
              parent__exact: row.original.id,
            })}`}
          >
            <Icon className="h-5" />
            <span className="pl-1">{row.getValue('name')}</span>
          </Link>
        );
      }

      return (
        <div className="flex space-x-1 font-medium">
          <Icon className="h-5" />
          <span className="pl-1">{row.getValue('name')}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'tags',
    header: 'Tags',
    cell: ({ row }) => {
      const tags = (row.getValue('tags') as Document['tags']) || [];
      if (tags.length === 0) {
        return <Badge className="ml-1 uppercase" />;
      }
      return (
        <div className="flex">
          {tags.map((tag) => (
            <Badge key={`${row.original.id}-${tag}`} className="uppercase">
              {tag}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: 'parent',
    header: tableHeader,
    cell: ({ row }) =>
      row.getValue<Document['parent']>('parent') ? (
        <Link
          className="underline"
          to={`/documents?parent__exact=${row.getValue<Document['parent']>('parent')}`}
        >
          {
            (
              _.find<Document['breadcrumbs']>(row.original.breadcrumbs, {
                id: row.getValue<Document['parent']>('parent') as any,
              }) as ArrayElement<Document['breadcrumbs']>
            )?.name
          }
        </Link>
      ) : null,
  },
  {
    accessorKey: 'created',
    header: tableHeader,
    cell: ({ row }) => (
      <span>
        {new Intl.DateTimeFormat(navigator.language).format(
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
        {new Intl.DateTimeFormat(navigator.language).format(
          new Date(row.getValue('updated')),
        )}
      </span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row, table }) => {
      const document = row.original;
      const searchParams = table.options.meta?.searchParams;

      // DDD ensures that this will always be "representative" of the model
      const docType = _.words(document.resourcetype)[0].toLowerCase();
      const slug = _.kebabCase(document.resourcetype);

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
              onClick={() => navigator.clipboard.writeText(document.id)}
            >
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="capitalize" asChild>
              <Link
                to={`/documents/${slug}/${document.id}?${RequestHelper.parseSearchParams({ ...searchParams })}`}
              >
                {`Edit ${docType}`}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="capitalize">{`Copy ${docType}`}</DropdownMenuItem>
            <DropdownMenuItem className="capitalize">{`Move ${docType}`}</DropdownMenuItem>
            <DropdownMenuItem className="capitalize">{`Delete ${docType}`}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default columns;
