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
} from 'lucide-react';
import { useState } from 'react';
import { data, Link, useFetcher } from 'react-router';

import { type Route } from '../_auth.documents_/+types/route';
import columns from './columns';

import { Badge } from '~/components/badge';
import { Button } from '~/components/button';
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardContent,
} from '~/components/card';
import { Input } from '~/components/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/table';
import apiRest from '~/libs/api.server';
import { RequestHelper } from '~/libs/request';
import sessionManager from '~/libs/session.server';
import { cn } from '~/libs/utils';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Documents' },
    { name: 'description', content: 'Graph Table: Documents page' },
  ];
}

type SearchParams = apiRest.DocumentsListData['query'] & { layout: string };

export async function loader(args: Route.LoaderArgs) {
  const cookie = await sessionManager.getCookie(args.request);
  const searchParams = new RequestHelper(
    args.request,
  ).getSearchParams<SearchParams>();

  const documentsList = await apiRest.documentsList({
    query: searchParams,
    headers: {
      Authorization: `Bearer ${cookie.get('access_token')}`,
    },
  });
  // return {Date} to easy switch between data sources without any janky
  // state management
  const lasUpdated = new Date().toISOString();

  console.log({ documentsList, searchParams, lasUpdated });
  return data({
    documentsList,
    searchParams,
    lasUpdated,
  });
}

const CLIENT_QUERY_PARAM = 'layout';

export default function Documents({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher<typeof loader>();
  console.log({
    loaderData,
    fetcher,
  });
  const [search, setSearch] = useState('');

  // render whichever data is "freshest" or empty list
  const data =
    (fetcher.data?.lasUpdated &&
    new Date(fetcher.data?.lasUpdated) > new Date(loaderData.lasUpdated)
      ? fetcher.data.documentsList.data?.results
      : loaderData.documentsList.data?.results) || [];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      searchParams: loaderData.searchParams,
      pagination: {
        next: loaderData.documentsList.data?.next,
        count: loaderData.documentsList.data?.count,
        previous: loaderData.documentsList.data?.previous,
      },
    },
  });

  const _renderHiddenInputs = () =>
    Object.keys(_.omit(loaderData.searchParams, CLIENT_QUERY_PARAM)).map(
      (k) => (
        <input
          key={k}
          name={k}
          type="hidden"
          value={String(
            loaderData.searchParams[
              k as keyof Route.ComponentProps['loaderData']['searchParams']
            ],
          )}
        />
      ),
    );

  let layout = 'table';
  if (!_.isEmpty(loaderData.searchParams)) {
    layout = loaderData.searchParams.layout || 'table';
  }
  const layouts = [
    { name: 'table', Icon: Table2 },
    { name: 'grid', Icon: LayoutGrid },
  ];
  const documentIcons = {
    folder: Folder,
    kit: ClipboardPen,
  };

  const disableClear =
    _.isEmpty(loaderData.searchParams) ||
    _.isEqual(Object.keys(loaderData.searchParams), [CLIENT_QUERY_PARAM]);

  return (
    <div>
      <Card className="m-4 p-4">
        <div className="flex place-content-between py-4">
          <fetcher.Form method="GET">
            <Input
              placeholder="Filter entries..."
              value={search}
              name="name__contains"
              onChange={(event) => {
                setSearch(event.target.value);
                fetcher.submit(event.currentTarget.form).catch(console.log);
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
                to={`/documents?${RequestHelper.parseSearchParams(_.pick({ ...loaderData.searchParams }, CLIENT_QUERY_PARAM))}`}
                className={cn(disableClear && 'contents')}
              >
                <X />
                Clear Filters
              </Link>
            </Button>
            <div className="ml-2 flex">
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
              const Icon =
                documentIcons[
                  document.doc_type as keyof typeof documentIcons
                ] || CircleOff;
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
    </div>
  );
}
