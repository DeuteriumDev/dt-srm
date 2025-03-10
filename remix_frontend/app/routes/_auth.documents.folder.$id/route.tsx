import _ from 'lodash';
import { AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { data, Link, useFetcher, useNavigate } from 'react-router';
import { type Route } from '../_auth.documents.folder.$id/+types/route';

import { Alert, AlertDescription, AlertTitle } from '~/components/alert';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '~/components/breadcrumb';
import { Button } from '~/components/button';
import { Checkbox } from '~/components/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/dropdown-menu';
import { Input } from '~/components/input';
import { Label } from '~/components/label';
import { Separator } from '~/components/separator';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '~/components/sheet';
import { Textarea } from '~/components/textarea';
import apiRest from '~/libs/api.server';
import { RequestHelper } from '~/libs/request';
import sessionManager from '~/libs/session.server';
import { type ArrayElement } from '~/libs/types';

export function meta(args: Route.MetaArgs) {
  return [
    { title: `Folder: ${args.data.foldersRetrieve.data?.name || 'Not Found'}` },
    { name: 'description', content: 'Graph Table: Folder page' },
  ];
}

type Crumb = ArrayElement<apiRest.Folder['breadcrumbs']>;

type SearchParams = apiRest.DocumentsListData['query'] & {
  layout?: string;
  parent_id?: string;
};

const FORM_SEARCH_PARAM = 'parent_id';

export async function loader(args: Route.LoaderArgs) {
  const searchParams = new RequestHelper(
    args.request,
  ).getSearchParams<SearchParams>();
  const cookie = await sessionManager.getCookie(args.request);
  if (args.params.id === 'new') {
    let breadcrumbs: Crumb[] = [];
    if (
      searchParams[FORM_SEARCH_PARAM] &&
      searchParams[FORM_SEARCH_PARAM] !== 'null'
    ) {
      const foldersRetrieve = await apiRest.foldersRetrieve({
        path: {
          id: searchParams.parent_id as string,
        },
        headers: {
          Authorization: `Bearer ${cookie.get(sessionManager.SESSION_access_token)}`,
        },
      });
      const parentFolder = foldersRetrieve.data;
      breadcrumbs = _.concat(parentFolder?.breadcrumbs, [
        parentFolder as unknown as Crumb,
      ]) as Crumb[];
    }
    return data({
      foldersRetrieve: {
        data: {
          id: undefined,
          name: 'new folder',
          parent: {
            id: searchParams.parent_id,
          },
          description: '',
          favorite: false,
          breadcrumbs,
        },
      },
      searchParams,
    });
  } else {
    const foldersRetrieve = await apiRest.foldersRetrieve({
      path: {
        id: args.params.id,
      },
      headers: {
        Authorization: `Bearer ${cookie.get(sessionManager.SESSION_access_token)}`,
      },
    });

    return data({
      foldersRetrieve,
      searchParams,
    });
  }
}

export async function action(_args: Route.ActionArgs) {}

export default function Folder(props: Route.ComponentProps) {
  const {
    loaderData,
    loaderData: { searchParams },
  } = props;
  const fetcher = useFetcher<typeof loader>();
  const combobox = useFetcher<typeof loader>();
  const [open, setOpen] = useState(true);
  const nav = useNavigate();
  console.log({
    props,
    loaderData,
    combobox,
    fetcher,
  });

  const _buildSearchParams = (crumb: Crumb): string => {
    const sp = {
      ..._.omit(searchParams, 'parent__isnull', 'parent__exact'),
      ...(_.isNull(crumb.parent)
        ? { parent__isnull: true }
        : { parent__exact: crumb.parent }),
    };
    return RequestHelper.parseSearchParams(sp);
  };

  const targetFolder = loaderData?.foldersRetrieve?.data;

  const _handleClose = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={_handleClose}>
      <SheetContent
        onCloseAutoFocus={() =>
          // nav after animation finishes
          nav(
            `/documents?${RequestHelper.parseSearchParams({ ..._.omit(searchParams, FORM_SEARCH_PARAM) })}`,
          )
        }
        onPointerDownOutside={_handleClose}
        onEscapeKeyDown={_handleClose}
        className="flex h-full w-[540px] flex-col sm:w-[540px] sm:max-w-none"
      >
        <SheetHeader className="grid gap-4 py-4">
          <SheetTitle>{`Edit Folder: "${targetFolder?.name}"`}</SheetTitle>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/documents?&parent__isnull=true&page=1&ordering=name">
                    Documents
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {(targetFolder?.breadcrumbs || []).length > 1 ? (
                <>
                  <BreadcrumbSeparator />
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1">
                      <BreadcrumbEllipsis className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {_.map(targetFolder?.breadcrumbs, (b) => (
                        <DropdownMenuItem key={b.id}>
                          <Link to={`/documents?${_buildSearchParams(b)}`}>
                            {b.name}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                _.flatten(
                  _.map(targetFolder?.breadcrumbs, (b) => [
                    <BreadcrumbSeparator key={`s-${b.id}`} />,
                    <BreadcrumbItem key={`i-${b.id}`}>
                      <BreadcrumbLink asChild>
                        <Link to={`/documents?${_buildSearchParams(b)}`}>
                          {b.name}
                        </Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>,
                  ]),
                )
              )}
              <BreadcrumbSeparator />
            </BreadcrumbList>
          </Breadcrumb>
        </SheetHeader>
        <Separator />
        <fetcher.Form
          action="POST"
          className="flex-grow space-y-4 overflow-y-auto py-4"
        >
          {_.has(loaderData, 'foldersRetrieve.error') && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {_.get(loaderData, 'foldersRetrieve.error.detail')}
              </AlertDescription>
            </Alert>
          )}
          <div>
            <Label htmlFor="name">Name</Label>
            <Input name="name" id="name" defaultValue={targetFolder?.name} />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={targetFolder?.description || ''}
            />
          </div>
          <div className="items-top flex space-x-2 pl-1">
            <Checkbox
              id="favorite"
              name="favorite"
              defaultChecked={targetFolder?.favorite}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="terms1"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Favorite
              </label>
            </div>
          </div>
          <input
            name="parent"
            type="hidden"
            value={targetFolder?.parent?.id || undefined}
          />
          <input
            name="id"
            type="hidden"
            value={targetFolder?.id || undefined}
          />
          {/* <combobox.Form action="GET">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-[200px] justify-between"
                >
                  {(parent && targetFolder?.parent.name) ||
                    'Select Parent folder ...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput
                    placeholder="Search folders..."
                    value={search}
                    onValueChange={(value) => {
                      combobox
                        .submit({
                          name__contains: value,
                        })
                        .catch(console.error);
                      setSearch(value);
                    }}
                  />
                  <CommandList>
                    <CommandEmpty>No folders found.</CommandEmpty>
                    <CommandGroup>
                      {_.map(
                        _.compact(
                          _.concat(
                            [
                              targetFolder?.parent,
                            ] as unknown as apiRest.Folder[],
                            parentFolderOptions,
                          ),
                        ),
                        (f) => (
                          <CommandItem
                            key={f.id}
                            value={f.id}
                            onSelect={(currentValue) => {
                              setParent(
                                currentValue === parent ? '' : currentValue,
                              );
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                parent === f.id ? 'opacity-100' : 'opacity-0',
                              )}
                            />
                            {f.name}
                          </CommandItem>
                        ),
                      )}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </combobox.Form> */}
        </fetcher.Form>
        <Separator />
        <SheetFooter className="mt-auto flex justify-end py-4">
          <Button onClick={_handleClose}>Cancel</Button>
          <Button disabled={_.isEmpty(targetFolder)} onClick={console.log}>
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
