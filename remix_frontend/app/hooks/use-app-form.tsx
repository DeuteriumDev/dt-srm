import { createFormHook, createFormHookContexts } from '@tanstack/react-form';
import _ from 'lodash';
import { CircleAlert } from 'lucide-react';

import { Checkbox } from '~/components/checkbox';
import { Input } from '~/components/input';
import { Label } from '~/components/label';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/popover';
import { Textarea } from '~/components/textarea';

const { fieldContext, formContext, useFieldContext } = createFormHookContexts();

function InputField({ label }: { label: string }) {
  const field = useFieldContext<string>();

  return (
    <div>
      {!_.isEmpty(field.getMeta().errors) && (
        <div className="col-span-4">
          <p id="email-error" className="text-sm text-red-600">
            {_.map(field.getMeta().errors, (e) => e.message).join(', ')}
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
            {_.map(field.getMeta().errors, (e) => e.message).join(', ')}
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
            <CircleAlert className="size-4 cursor-pointer" />
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

export default useAppForm;
