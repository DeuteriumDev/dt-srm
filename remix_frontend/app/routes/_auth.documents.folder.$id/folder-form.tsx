import { createFormHook, createFormHookContexts } from '@tanstack/react-form';
import _ from 'lodash';
import { Check, X, CircleAlert } from 'lucide-react';
import { useFetcher } from 'react-router';

import { Button } from '~/components/button';
import { Checkbox } from '~/components/checkbox';
import { Input } from '~/components/input';
import { Label } from '~/components/label';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/popover';
import { Textarea } from '~/components/textarea';
import type apiRest from '~/libs/api.server';
import validation from '~/libs/validation';

const { fieldContext, formContext, useFieldContext } = createFormHookContexts();

function InputField({ label }: { label: string }) {
  const field = useFieldContext<string>();
  return (
    <div>
      {!_.isEmpty(field.getMeta().errors) && (
        <div className="col-span-4">
          <p id="email-error" className="text-sm text-red-600">
            {field.getMeta().errors.join(',')}
          </p>
        </div>
      )}
      <Label htmlFor={field.name}>{label}</Label>
      <Input
        name={field.name}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        value={field.state.value}
      />
    </div>
  );
}

function TextAreaField({ label }: { label: string }) {
  const field = useFieldContext<string>();

  return (
    <div>
      {!_.isEmpty(field.getMeta().errors) && (
        <div className="col-span-4">
          <p id="email-error" className="text-sm text-red-600">
            {field.getMeta().errors.join(',')}
          </p>
        </div>
      )}
      <Label htmlFor={field.name}>{label}</Label>
      <Textarea
        name={field.name}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        value={field.state.value}
      />
    </div>
  );
}

function CheckboxField({ label, help }: { label: string; help?: string }) {
  const field = useFieldContext<boolean>();
  return (
    <div className="flex items-center space-x-2">
      {!_.isEmpty(field.getMeta().errors) && (
        <div className="col-span-4">
          <p id="email-error" className="text-sm text-red-600">
            {field.getMeta().errors.join(',')}
          </p>
        </div>
      )}
      <Checkbox
        name={field.name}
        checked={field.state.value}
        onCheckedChange={() => {
          field.handleChange(!field.state.value);
        }}
        onBlur={field.handleBlur}
      />
      <label
        htmlFor={field.name}
        className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          field.handleChange(!field.state.value);
        }}
        onBlur={field.handleBlur}
      >
        {label}
      </label>
      {help && (
        <Popover>
          <PopoverTrigger asChild>
            <CircleAlert className="size-4" />
          </PopoverTrigger>
          <PopoverContent side="top">
            <p className="text-sm italic">{help}</p>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

const { useAppForm } = createFormHook({
  fieldComponents: {
    InputField,
    TextAreaField,
    CheckboxField,
  },
  formComponents: {},
  fieldContext,
  formContext,
});

const useFolderForm = (targetFolder: apiRest.Folder, onFinish: () => any) => {
  const folderAction = useFetcher({ key: 'folderFetcher' });
  const formController = useAppForm({
    defaultValues: {
      name: targetFolder.name,
      parent: targetFolder.parent || null,
      description: targetFolder.description || '',
      favorite: (targetFolder.favorite || false) as boolean,
      inherit_permissions: (targetFolder.inherit_permissions ||
        true) as boolean,
    },
    validators: {
      onChange: ({ value }) => validation.zFolderRequest.safeParse(value),
    },
    onSubmit: async ({ value }: { value: apiRest.FolderRequest }) => {
      await folderAction.submit(_.omit(value, ['groups']), { method: 'POST' });
      onFinish();
    },
  });

  return { formController, folderAction };
};

export default useFolderForm;
