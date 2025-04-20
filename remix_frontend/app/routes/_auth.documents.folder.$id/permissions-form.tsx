import { createFormHookContexts, createFormHook } from '@tanstack/react-form';
import _ from 'lodash';
import { Check, ChevronsUpDown, CircleAlert, Table, X } from 'lucide-react';
import { Link, useFetcher } from 'react-router';
import { Button } from '~/components/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '~/components/command';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/popover';
import { PermissionGroup } from './types';
import { RequestHelper } from '~/libs/request';
import apiRest from '~/libs/api.server';
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '~/components/table';
import { cn } from '~/libs/utils';
import folderForm from './use-folder-form';

const { fieldContext, formContext, useFieldContext } = createFormHookContexts();

export function ButtonToggle({
  disabled,
  value,
  onToggle,
}: {
  value: boolean;
  onToggle: (val: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <Button
      variant={value ? 'default' : 'outline'}
      size="icon"
      className="h-6 w-6"
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onToggle(!value);
      }}
      disabled={disabled}
    >
      {value ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      <span className="sr-only">{value ? 'Enabled' : 'Disabled'}</span>
    </Button>
  );
}

function ButtonToggleField({ disabled }: { disabled: boolean }) {
  const field = useFieldContext<boolean>();
  return (
    <ButtonToggle
      disabled={disabled}
      value={field.state.value}
      onToggle={field.handleChange}
    />
  );
}

const { useAppForm } = createFormHook({
  fieldComponents: {},
  formComponents: {},
  fieldContext,
  formContext,
});

const usePermissionForm = (
  targetFolder: apiRest.Folder,
  onFinish: () => any,
) => {
  const folderAction = useFetcher({ key: 'folderFetcher' });
  const formController = useAppForm({
    defaultValues: {
      //   name: targetFolder.name,
      //   parent: targetFolder.parent || null,
      //   description: targetFolder.description || '',
      //   favorite: (targetFolder.favorite || false) as boolean,
      //   inherit_permissions: (targetFolder.inherit_permissions ||
      //     true) as boolean,
    },
    validators: {
      //   onChange: ({ value }) => validation.zFolderRequest.safeParse(value),
    },
    onSubmit: async ({ value }) => {
      //   await folderAction.submit(_.omit(value, ['groups']), { method: 'POST' });
      onFinish();
    },
  });

  return { formController, folderAction };
};

export function PermissionsForm(props: {
  handleSubmit: () => void;
  groups: PermissionGroup[];
  form: ReturnType<typeof createFormHook>['useAppForm'];
}) {
  const { handleSubmit, groups, form } = props;
  const permissionAction = useFetcher();
  //   const permissionForm =  usePermissionForm({

  //   });
  return (
    <>
      {/* <form
        className="flex-grow space-y-4 overflow-y-auto py-4"
        onSubmit={handleSubmit}
      >
        <h3 className="pl-1">Folder Permissions</h3>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full justify-between"
            >
              Search groups ...
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[440px] p-0">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Search groups..."
                onValueChange={(search) => {
                  permissionAction
                    .load(
                      `?${RequestHelper.parseSearchParams({
                        groups: { name__contains: search },
                      })}`,
                    )
                    .catch(console.warn);
                }}
              />
              <CommandList>
                {permissionAction.state === 'loading' && (
                  <CommandEmpty>Loading...</CommandEmpty>
                )}
                {permissionAction.state !== 'loading' && _.isEmpty(groups) && (
                  <CommandEmpty>No groups found.</CommandEmpty>
                )}
                <CommandGroup>
                  <form.Subscribe
                    selector={(state) => state.values.groups}
                    children={(permissionGroups) =>
                      _.map(groups, (g) => {
                        const selected = _.findIndex(permissionGroups, {
                          id: g.id,
                        });
                        return (
                          <CommandItem
                            key={g.id}
                            onSelect={() => {
                              if (selected > -1) {
                                folderForm
                                  .removeFieldValue('groups', selected)
                                  .catch(console.warn);
                              } else if (g.id && g.name) {
                                folderForm.pushFieldValue('groups', {
                                  id: g.id,
                                  name: g.name,
                                  can_create: true,
                                  can_read: true,
                                  can_update: true,
                                  can_delete: true,
                                  object_id: param.id || '',
                                });
                              }
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                selected > -1 ? 'opacity-100' : 'opacity-0',
                              )}
                            />
                            {g.name}
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
        <folderForm.Field name="groups" mode="array">
          {(field) => (
            <div className="rounded-md border text-sm">
              <Table className="[&_tr_td]:py-2 [&_tr_th]:py-2">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Selected Groups</TableHead>
                    <TableHead className="text-center">Create</TableHead>
                    <TableHead className="text-center">Read</TableHead>
                    <TableHead className="text-center">Update</TableHead>
                    <TableHead className="text-center">Delete</TableHead>
                    <TableHead className="text-center" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {_.map(
                    _.filter(
                      targetFolder?.permissions,
                      (p) => p.object_id !== param.id && inherit_permissions,
                    ),
                    (p) => {
                      const disabled = true;
                      // fake the form index to re-use components when there's no data
                      return (
                        <TableRow
                          key={`${p.object_id}-${p.group.id}`}
                          className={cn(
                            disabled && 'bg-muted/50 text-muted-foreground',
                          )}
                        >
                          <TableCell>
                            {disabled && (
                              <Popover>
                                <PopoverTrigger className="flex items-center font-medium">
                                  <CircleAlert className="mr-1 size-4 bg-muted/0" />
                                  {p.group.name}
                                </PopoverTrigger>
                                <PopoverContent>
                                  <p className="text-sm italic">
                                    You can't edit this permission from here. To
                                    edit this permission{' '}
                                    <Link
                                      to={`/documents/folder/${p.object_id}`}
                                      className="underline"
                                    >
                                      click here
                                    </Link>
                                  </p>
                                  <p className="text-sm italic">
                                    To turn this into a new permission, toggle
                                    "inherit from parent"
                                  </p>
                                </PopoverContent>
                              </Popover>
                            )}
                            {!disabled && p.group.name}
                          </TableCell>
                          <TableCell>
                            <ButtonToggle
                              value={!!p.can_create}
                              disabled={true}
                              onToggle={console.warn}
                            />
                          </TableCell>
                          <TableCell>
                            <ButtonToggle
                              value={!!p.can_read}
                              disabled={true}
                              onToggle={console.warn}
                            />
                          </TableCell>
                          <TableCell>
                            <ButtonToggle
                              value={!!p.can_update}
                              disabled={true}
                              onToggle={console.warn}
                            />
                          </TableCell>
                          <TableCell>
                            <ButtonToggle
                              value={!!p.can_delete}
                              disabled={true}
                              onToggle={console.warn}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              disabled={disabled}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    },
                  )}
                  {field.state.value.map((group, index) => {
                    const disabled = group.object_id !== param.id;
                    return (
                      <TableRow
                        key={`${group.object_id}-${group.id}`}
                        className={cn(
                          disabled && 'bg-muted/50 text-muted-foreground',
                        )}
                      >
                        <TableCell>{group.name}</TableCell>
                        {[
                          'can_create',
                          'can_read',
                          'can_update',
                          'can_delete',
                        ].map((pName) => (
                          <TableCell
                            key={`${pName}-${group.id}-${group.object_id}`}
                          >
                            <folderForm.Subscribe
                              selector={(state) =>
                                state.values.groups[index][
                                  pName as keyof PermissionGroup
                                ]
                              }
                              children={(p) => (
                                <ButtonToggle
                                  value={!!p}
                                  onToggle={(v) =>
                                    folderForm.setFieldValue(
                                      `groups[${index}].${pName as keyof PermissionGroup}`,
                                      () => v,
                                    )
                                  }
                                />
                              )}
                            />
                          </TableCell>
                        ))}

                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              field.removeValue(index);
                            }}
                            disabled={disabled}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </folderForm.Field>
      </form> */}
    </>
  );
}
