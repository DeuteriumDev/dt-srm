import usePreviousValue from 'beautiful-react-hooks/usePreviousValue';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { useFetcher } from 'react-router';

import { z } from 'zod';
import useAppForm from '~/hooks/use-app-form';
import { useToast } from '~/hooks/use-toast';
import type apiRest from '~/libs/api.server';

const useMemberForm = (
  groupMembers: apiRest.CustomUser[],
  onFinish: () => any,
) => {
  const formAction = useFetcher();
  const [submitting, setSubmitting] = useState(false);
  const prevState = usePreviousValue(submitting);
  const { toast } = useToast();

  const formController = useAppForm({
    defaultValues: {
      members: _.map(groupMembers, (m) => _.pick(m, ['id', 'email'])) as {
        id: string;
        email: string;
      }[],
    },
    validators: {
      onChange: z.object({
        members: z
          .array(z.object({ id: z.string(), email: z.string() }))
          .min(1, { message: 'At least one member is required' }),
      }),
    },
    onSubmit: async ({ value }) => {
      setSubmitting(true);
      return formAction
        .submit(
          { members: _.map(value.members, 'id') },
          {
            method: 'PUT',
            encType: 'application/json',
          },
        )
        .then(() => {
          setSubmitting(false);
        });
    },
  });

  useEffect(() => {
    if (!submitting && prevState) {
      if (formAction.data?.error) {
        toast({
          title: 'Error',
          description: formAction.data.error,
          variant: 'destructive',
        });
      } else {
        onFinish();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitting, prevState]);

  return { formController, formAction };
};

export default useMemberForm;
