import _ from 'lodash';
import { AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { type Route } from '../_auth.documents.folder.$id/+types/route';
import actionServer from './action.server';
import useFolderForm from './folder-form';
import loaderServer from './loader.server';
import { type Crumb } from './types';

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/dropdown-menu';
import { Separator } from '~/components/separator';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '~/components/sheet';
import type apiRest from '~/libs/api.server';
import { RequestHelper } from '~/libs/request';

export { actionServer as action, loaderServer as loader };

export function meta(args: Route.MetaArgs) {
  return [
    { title: `Folder: ${args.data.foldersRetrieve.data?.name || 'Not Found'}` },
    { name: 'description', content: 'Graph Table: Folder page' },
  ];
}

const MAX_BREAD_CRUMBS = 1;

export default function Folder(props: Route.ComponentProps) {
  const {
    loaderData,
    loaderData: { searchParams },
  } = props;
  const targetFolder = loaderData?.foldersRetrieve?.data;
  const nav = useNavigate();
  const param = useParams();

  const [open, setOpen] = useState(true);

  const _buildSearchParams = (crumb: Crumb): string => {
    const sp = {
      ..._.omit(searchParams, 'parent__isnull', 'parent__exact'),
      ...(_.isNull(crumb.parent)
        ? { parent__isnull: true }
        : { parent__exact: crumb.parent }),
    };
    return RequestHelper.parseSearchParams(sp);
  };

  const _handleClose = () => {
    setOpen(false);
  };

  const { formController: folderForm, folderAction } = useFolderForm(
    targetFolder as apiRest.Folder,
    _handleClose,
  );

  const _handleSubmit = (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    return folderForm.handleSubmit();
  };

  // const groups =
  //   new Date(folderAction.data?.lastUpdated || 0) >
  //   new Date(loaderData.lastUpdated)
  //     ? folderAction.data?.groupsList.data?.results
  //     : loaderData.groupsList.data?.results;

  console.log({
    props,
    loaderData,
    folderAction,
    folderForm,
    // groups,
    param,
  });

  return (
    <Sheet open={open} onOpenChange={_handleClose}>
      <SheetContent
        onCloseAutoFocus={() =>
          // nav after animation finishes
          nav(`/documents?${RequestHelper.parseSearchParams(searchParams)}`)
        }
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
              {(targetFolder?.breadcrumbs || []).length > MAX_BREAD_CRUMBS ? (
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
        <form
          className="space-y-4 overflow-y-auto py-4"
          onSubmit={_handleSubmit}
        >
          {_.has(folderForm, 'data.error') && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Server error</AlertDescription>
            </Alert>
          )}
          <folderForm.AppField
            name="name"
            children={(field) => <field.InputField label="Name" />}
          />
          <folderForm.AppField
            name="description"
            children={(field) => <field.TextAreaField label="Description" />}
          />
          <folderForm.AppField
            name="favorite"
            children={(field) => (
              <field.CheckboxField
                label="Favorite"
                help="Favorite folders appear on the dashboard"
              />
            )}
          />
          {/* <folderForm.AppField
            name="inherit_permissions"
            children={(field) => (
              <field.CheckboxField
                label="Inherit Permissions from parent"
                help="Inherit permissions from parent folder. If disabled, requires at least 1 group to be selected."
              />
            )}
          /> */}
        </form>
        <Separator />
        <SheetFooter className="mt-auto flex justify-end py-4">
          <Button onClick={_handleClose}>Cancel</Button>
          <folderForm.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button disabled={isSubmitting} onClick={_handleSubmit}>
                Save changes
              </Button>
            )}
          </folderForm.Subscribe>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
