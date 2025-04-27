import _ from 'lodash';
import { Outlet } from 'react-router';

import { type Route } from '../_auth.$ctype/+types/route';
import loader from './loader.server';

import DataTable from '~/components/datatable';
import useDocumentsTable from '~/hooks/use-documents-table';
import useGroupsTable from '~/hooks/use-groups-table';
import useSearchParams from '~/hooks/use-search-params';
import useUsersTable from '~/hooks/use-users-table';

const HOOK_MAP = {
  groups: useGroupsTable,
  users: useUsersTable,
  documents: useDocumentsTable,
  test: useGroupsTable,
};
export { loader };

export default function Groups(props: Route.ComponentProps) {
  const {
    params: { ctype },
  } = props;
  const { searchParams } = useSearchParams();
  if (!Object.keys(HOOK_MAP).includes(ctype)) {
    return (
      <div className="m-4 flex justify-center rounded border border-red-500 p-4 text-center">
        <p className="italic text-red-500">{`Invalid ctype: ${ctype}`}</p>
      </div>
    );
  }
  const { controller, fetcher } = HOOK_MAP[ctype as keyof typeof HOOK_MAP]();

  console.log({ props, controller, fetcher });

  return (
    <div>
      <DataTable
        controller={controller}
        fetcher={fetcher}
        ctype={ctype}
        searchParams={searchParams}
      />
      {/* <div className="flex flex-1 flex-col gap-4 pt-0">
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
                    {row.getVisibleCells().map((cell) => {
                      console.log({ row: cell.row });
                      return (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      );
                    })}
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
        </div> */}
      <Outlet />
    </div>
  );
}
