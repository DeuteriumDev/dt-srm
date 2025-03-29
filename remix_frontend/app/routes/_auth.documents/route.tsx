import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import _ from 'lodash';
import {
  LayoutGrid,
  Table2,
  X,
  Folder,
  ClipboardPen,
  CircleOff,
  Plus,
  Receipt,
} from 'lucide-react';
import { useState } from 'react';
import { Link, Outlet, useFetcher } from 'react-router';

import { type Route } from '../_auth.documents/+types/route';
import columns from './columns';

import loader from './loader.server';
import { Badge } from '~/components/badge';
import { Button } from '~/components/button';
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardContent,
} from '~/components/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/dropdown-menu';
import { Input } from '~/components/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/table';
import { RequestHelper } from '~/libs/request';
import { type IconNode, type Document, type PageLayout } from '~/libs/types';
import { cn } from '~/libs/utils';

export { loader };

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Documents' },
    { name: 'description', content: 'Graph Table: Documents page' },
  ];
}

const CLIENT_ONLY_QUERY_PARAM = 'layout';

export default function Documents(props: Route.ComponentProps) {
  const {
    loaderData,
    loaderData: { searchParams },
  } = props;
  const fetcher = useFetcher<typeof loader>();
  console.log({
    props,
  });
  const [search, setSearch] = useState('');

  // render whichever data is "freshest" or empty list
  const data =
    (fetcher.data?.lastUpdated &&
    new Date(fetcher.data?.lastUpdated) > new Date(loaderData.lastUpdated)
      ? fetcher.data.documentsList.data?.results
      : loaderData.documentsList.data?.results) || [];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      searchParams,
      pagination: {
        next: loaderData.documentsList.data?.next,
        count: loaderData.documentsList.data?.count,
        previous: loaderData.documentsList.data?.previous,
      },
    },
  });

  const _renderHiddenInputs = () =>
    Object.keys(_.omit(searchParams, CLIENT_ONLY_QUERY_PARAM)).map((k) => (
      <input
        key={k}
        name={k}
        type="hidden"
        value={String(
          searchParams[
            k as keyof Route.ComponentProps['loaderData']['searchParams']
          ],
        )}
      />
    ));

  const layout: PageLayout = searchParams?.layout || 'table';

  const layouts = [
    { name: 'table', Icon: Table2 },
    { name: 'grid', Icon: LayoutGrid },
  ];
  const documentIcons: Record<Document['resourcetype'], IconNode> = {
    Folder: Folder,
    Invoice: Receipt,
    Kit: ClipboardPen,
  };

  const disableClear =
    _.isEmpty(searchParams) ||
    _.isEqual(Object.keys(searchParams), [CLIENT_ONLY_QUERY_PARAM]);

  return (
    <div>
      <Card className={cn('m-8 p-8', layout === 'grid' && 'border-none')}>
        <div className="flex place-content-between py-4">
          <fetcher.Form method="GET">
            <Input
              placeholder="Filter entries..."
              value={search}
              name="name__contains"
              onChange={(event) => {
                setSearch(event.target.value);
                fetcher.submit(event.currentTarget.form).catch(console.warn);
              }}
              className="max-w-sm"
            />
            {_renderHiddenInputs()}
          </fetcher.Form>
          <div className="flex">
            <Button
              disabled={disableClear}
              variant={disableClear ? 'ghost' : 'default'}
              asChild
            >
              <Link
                to={`/documents?${RequestHelper.parseSearchParams(_.pick({ ...loaderData.searchParams }, CLIENT_ONLY_QUERY_PARAM))}`}
                className={cn(disableClear && 'contents')}
              >
                <X />
                Clear Filters
              </Link>
            </Button>
            <div className="mx-2 flex">
              {layouts.map((l, index) => (
                <Button
                  asChild
                  key={l.name}
                  className={cn(
                    index === 0 && 'rounded-r-none',
                    index === layouts.length - 1 && 'rounded-l-none',
                    index !== 0 &&
                      index !== layouts.length - 1 &&
                      'rounded-none',
                  )}
                  disabled={layout === l.name}
                  variant={layout === l.name ? 'ghost' : 'default'}
                >
                  <Link
                    to={`/documents?${RequestHelper.parseSearchParams({ ...loaderData.searchParams, layout: l.name })}`}
                  >
                    <l.Icon />
                  </Link>
                </Button>
              ))}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  New
                  <Plus />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link
                    to={`/documents/folder/new?${RequestHelper.parseSearchParams(loaderData.searchParams)}`}
                  >
                    Folder
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <Table className={cn(!(layout === 'table') && 'hidden')}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex flex-1 flex-col gap-4 pt-0">
          <div
            className={cn(
              'grid auto-rows-min gap-4 md:grid-cols-3',
              !(layout === 'grid') && 'hidden',
            )}
          >
            {table.getRowModel().rows.map((row) => {
              const document = row.original;
              const Icon = documentIcons[document.resourcetype] || CircleOff;
              return (
                <Card key={row.id}>
                  <CardHeader className="pt-6">
                    <CardTitle className="flex items-center gap-2">
                      <Icon />
                      <Link
                        className="underline"
                        to={`/documents?${RequestHelper.parseSearchParams({ ..._.omit(loaderData.searchParams, 'parent__isnull'), parent__exact: document.id })}`}
                      >
                        {document.name}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {document.tags.map((t) => (
                      <Badge key={`${row.id}-tag-${t}`} className="uppercase">
                        {t}
                      </Badge>
                    ))}
                  </CardContent>
                  <CardFooter>
                    <div className="text-sm italic">
                      {`Updated: ${new Intl.DateTimeFormat(
                        navigator.language,
                      ).format(new Date(document.created))}`}
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
        <div className="flex items-center justify-end space-x-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!loaderData.documentsList.data?.previous}
            asChild
          >
            <Link
              to={`?${RequestHelper.parseSearchParams({ ...loaderData.searchParams, page: loaderData.documentsList.data?.previous })}`}
            >
              Previous
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            disabled={!loaderData.documentsList.data?.next}
          >
            <Link
              to={`?${RequestHelper.parseSearchParams({ ...loaderData.searchParams, page: loaderData.documentsList.data?.next })}`}
            >
              Next
            </Link>
          </Button>
        </div>
      </Card>
      <Outlet />
    </div>
  );
}
