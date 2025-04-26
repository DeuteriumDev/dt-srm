import { createFormHook, createFormHookContexts } from '@tanstack/react-form';
import _ from 'lodash';
import { CircleAlert, X } from 'lucide-react';
import { Button } from '~/components/button';

import { Checkbox } from '~/components/checkbox';
import { Input } from '~/components/input';
import { Label } from '~/components/label';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/popover';
import { Textarea } from '~/components/textarea';
import { cn } from '~/libs/utils';

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

function CheckboxField({
  label,
  help,
  classes,
}: {
  label: string;
  help?: string;
  classes?: {
    container?: string;
    error?: string;
    checkbox?: string;
    label?: string;
  };
}) {
  const field = useFieldContext<boolean>();
  return (
    <div className={cn('flex items-center space-x-2', classes?.container)}>
      {!_.isEmpty(field.getMeta().errors) && (
        <div className={cn(classes?.error)}>
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
        className={cn(classes?.checkbox)}
      />
      <label
        htmlFor={field.name}
        className={cn(
          'cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
          classes?.label,
        )}
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

function ButtonRemoveField({
  label,
  index,
  classes,
}: {
  label: string;
  index: number;
  classes?: { container?: string; label?: string; button?: string };
}) {
  const field = useFieldContext();
  return (
    <div
      className={cn(
        'flex items-center justify-between px-2',
        classes?.container,
      )}
    >
      <span className={cn(classes?.label)}>{label}</span>
      <Button
        onClick={() => field.removeValue(index)}
        className={cn(classes?.button)}
      >
        <X />
      </Button>
    </div>
  );
}

const { useAppForm } = createFormHook({
  fieldComponents: {
    InputField,
    TextAreaField,
    CheckboxField,
    ButtonRemoveField,
  },
  formComponents: {},
  fieldContext,
  formContext,
});

export default useAppForm;
