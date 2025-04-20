import _ from 'lodash';
import { AlertCircle, Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { type Route } from '../_auth.groups.members.$id/+types/route';
import actionServer from './action.server';
import loaderServer from './loader.server';
import useMemberForm from './use-member-form';

import { Alert, AlertDescription, AlertTitle } from '~/components/alert';
import { Button } from '~/components/button';
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandList,
  CommandItem,
  CommandGroup,
} from '~/components/command';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/popover';
import { Separator } from '~/components/separator';
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

  const { formController: memberForm, formAction } = useMemberForm(
    (loaderData.groupsRetrieve.data?.members as apiRest.CustomUser[]) || [],
    _handleClose,
  );

  const _handleSubmit = (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    return memberForm.handleSubmit();
  };

  const users =
    new Date(loaderData.lastUpdated) > new Date(formAction.data?.lastUpdated)
      ? loaderData.usersList.data?.results
      : formAction.data?.usersList?.data?.results;

  return (
    <Dialog open={open} onOpenChange={_handleClose}>
      <DialogContent
        onCloseAutoFocus={() =>
          // nav after animation finishes
          nav(`/groups?${RequestHelper.parseSearchParams(searchParams)}`)
        }
        onEscapeKeyDown={_handleClose}
        className="flex h-4/6 w-[540px] flex-col sm:w-[540px] sm:max-w-none"
      >
        <DialogHeader className="grid gap-4 py-4">
          <DialogTitle>{`Edit Group Members: "${targetGroup?.name}"`}</DialogTitle>
        </DialogHeader>
        <Separator />
        <form
          className="space-y-4 overflow-y-auto py-4"
          onSubmit={_handleSubmit}
        >
          {_.has(memberForm, 'data.error') && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Server error</AlertDescription>
            </Alert>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between"
              >
                Search users ...
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[490px] p-0">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Search users..."
                  onValueChange={(search) => {
                    formAction
                      .load(
                        `?${RequestHelper.parseSearchParams({
                          ...searchParams,
                          users: { email__contains: search },
                        })}`,
                      )
                      .catch(console.warn);
                  }}
                />
                <CommandList>
                  {formAction.state === 'loading' && (
                    <CommandEmpty>Loading...</CommandEmpty>
                  )}
                  {formAction.state !== 'loading' && _.isEmpty(users) && (
                    <CommandEmpty>No users found.</CommandEmpty>
                  )}
                  <CommandGroup>
                    <memberForm.Subscribe
                      selector={(state) => state.values.members}
                      children={(members) =>
                        _.map(users, (u) => {
                          const selected = !!_.find(
                            members,
                            (m) => m.id === u.id,
                          );
                          return (
                            <CommandItem
                              key={`new-${u.id}`}
                              onSelect={() => {
                                memberForm.pushFieldValue('members', u);
                              }}
                              disabled={selected}
                            >
                              <Check className="mr-2 h-4 w-4 opacity-0" />
                              {u.email}
                            </CommandItem>
                          );
                        })
                      }
                    />
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <memberForm.AppField name="members" mode="array">
            {(field) => (
              <div className="flex flex-col gap-2 rounded-md border p-2">
                {field.state.value.length > 0
                  ? field.state.value.map((member, i) => (
                      <field.ButtonRemoveField
                        key={`form-${member.id}`}
                        label={member.email}
                        index={i}
                      />
                    ))
                  : !_.isEmpty(field.getMeta().errors) && (
                      <div>
                        <p
                          id="email-error"
                          className="px-2 text-sm text-red-600"
                        >
                          {_.map(field.getMeta().errors, 'message').join(',')}
                        </p>
                      </div>
                    )}
              </div>
            )}
          </memberForm.AppField>
        </form>
        <Separator />
        <DialogFooter className="mt-auto flex justify-end py-4">
          <Button onClick={_handleClose}>Cancel</Button>
          <memberForm.Subscribe
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
          </memberForm.Subscribe>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
