import { flexRender, type useReactTable } from '@tanstack/react-table';
import _ from 'lodash';
import { Plus, X } from 'lucide-react';
import { Link, type useFetcher } from 'react-router';

import { Button } from '~/components/button';
import { Card } from '~/components/card';
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
import useSearchParams from '~/hooks/use-search-params';
import { RequestHelper } from '~/libs/request';
import { cn } from '~/libs/utils';

export default function DataTable(props: {
  fetcher: ReturnType<typeof useFetcher>;
  controller: ReturnType<typeof useReactTable<any>>;
}) {
  const { searchParams } = useSearchParams();
  const { fetcher, controller } = props;

  console.log({ controller, fetcher });

  const _renderHiddenInputs = () =>
    Object.keys(_.omit(searchParams)).map((k) => (
      <input key={k} name={k} type="hidden" value={String(searchParams[k])} />
    ));

  const disableClear = _.isEmpty(searchParams);

  return (
    <Card className={cn('m-8 p-8')}>
      <div className="flex place-content-between py-4">
        <fetcher.Form method="GET">
          <Input
            placeholder="Filter entries..."
            name="name__contains"
            onChange={(event) => {
              fetcher.submit(event.currentTarget.form).catch(console.warn);
            }}
            className="max-w-sm"
          />
          {_renderHiddenInputs()}
        </fetcher.Form>
        <div className="flex space-x-2">
          <Button
            disabled={disableClear}
            variant={disableClear ? 'ghost' : 'default'}
            asChild
          >
            <Link
              to={`/groups?${RequestHelper.parseSearchParams({})}`}
              className={cn(disableClear && 'contents')}
            >
              <X />
              Clear Filters
            </Link>
          </Button>

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
                  to={`/groups/new?${RequestHelper.parseSearchParams(searchParams)}`}
                >
                  Group
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Table>
        <TableHeader>
          {controller.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{ width: `${header.getSize()}px` }}
                  >
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
          {controller.getRowModel().rows?.length > 0 ? (
            controller.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    style={{ width: `${cell.column.getSize()}px` }}
                    className={cn(
                      cell.column.id === 'actions' && 'text-center',
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={controller.options.columns.length}
                className="h-24 text-center"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-end space-x-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!controller.getCanPreviousPage()}
          asChild
        >
          <Link
            to={`?${RequestHelper.parseSearchParams({ ...searchParams, page: controller.getState().pagination.pageIndex })}`}
          >
            Previous
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          asChild
          disabled={!controller.getCanNextPage()}
        >
          <Link
            to={`?${RequestHelper.parseSearchParams({ ...searchParams, page: controller.getState().pagination.pageIndex + 2 })}`}
          >
            Next
          </Link>
        </Button>
      </div>
    </Card>
  );
}
