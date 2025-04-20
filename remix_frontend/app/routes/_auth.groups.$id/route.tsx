import _ from 'lodash';
import { AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { type Route } from '../_auth.groups.$id/+types/route';
import actionServer from './action.server';
import loaderServer from './loader.server';
import useGroupForm from './use-group-form';

import { Alert, AlertDescription, AlertTitle } from '~/components/alert';
import { Button } from '~/components/button';
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
    { title: `Folder: ${args.data.groupsRetrieve.data?.name || 'Not Found'}` },
    { name: 'description', content: 'Graph Table: Folder page' },
  ];
}

export default function Folder(props: Route.ComponentProps) {
  const {
    loaderData,
    loaderData: { searchParams },
  } = props;
  const targetGroup = loaderData?.groupsRetrieve?.data;
  const nav = useNavigate();

  const [open, setOpen] = useState(true);

  const _handleClose = () => {
    setOpen(false);
  };

  const { formController: groupForm } = useGroupForm(
    targetGroup as apiRest.CustomGroup,
    _handleClose,
  );

  const _handleSubmit = (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    return groupForm.handleSubmit();
  };

  return (
    <Sheet open={open} onOpenChange={_handleClose}>
      <SheetContent
        onCloseAutoFocus={() =>
          // nav after animation finishes
          nav(`/groups?${RequestHelper.parseSearchParams(searchParams)}`)
        }
        onEscapeKeyDown={_handleClose}
        className="flex h-full w-[540px] flex-col sm:w-[540px] sm:max-w-none"
      >
        <SheetHeader className="grid gap-4 py-4">
          <SheetTitle>{`Edit Group: "${targetGroup?.name}"`}</SheetTitle>
        </SheetHeader>
        <Separator />
        <form
          className="space-y-4 overflow-y-auto py-4"
          onSubmit={_handleSubmit}
        >
          {_.has(groupForm, 'data.error') && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Server error</AlertDescription>
            </Alert>
          )}
          <groupForm.AppField
            name="name"
            children={(field) => <field.InputField label="Name" />}
          />
          <groupForm.AppField
            name="description"
            children={(field) => <field.TextAreaField label="Description" />}
          />
        </form>
        <Separator />
        <SheetFooter className="mt-auto flex justify-end py-4">
          <Button onClick={_handleClose}>Cancel</Button>
          <groupForm.Subscribe
            selector={(state) =>
              state.isSubmitting ||
              state.isValidating ||
              !_.isEmpty(state.errors)
            }
          >
            {(disabled) => (
              <Button disabled={disabled} onClick={_handleSubmit}>
                Save changes
              </Button>
            )}
          </groupForm.Subscribe>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
