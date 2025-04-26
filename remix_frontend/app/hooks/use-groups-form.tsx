import usePreviousValue from 'beautiful-react-hooks/usePreviousValue';
import { useEffect } from 'react';
import { useFetcher } from 'react-router';

import useAppForm from '~/hooks/use-app-form';
import { useToast } from '~/hooks/use-toast';
import type apiRest from '~/libs/api.server';
import validation from '~/libs/validation';

const HIDDEN_DEFAULT = false;

const useGroupForm = (
  targetGroup: apiRest.CustomGroup,
  onFinish: () => any,
) => {
  const formAction = useFetcher();
  const prevState = usePreviousValue(formAction.state);
  const { toast } = useToast();

  const formController = useAppForm({
    defaultValues: {
      name: targetGroup.name,
      parent: targetGroup.parent,
      description: targetGroup.description,
      favorite: targetGroup.hidden || HIDDEN_DEFAULT,
    } as apiRest.CustomGroupRequest,
    validators: {
      onChange: validation.zCustomGroupRequest,
    },
    onSubmit: async ({ value }) => {
      return formAction.submit(value, { method: 'POST' });
    },
  });

  useEffect(() => {
    if (formAction.state === 'idle' && prevState === 'loading') {
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
  }, [formAction.state, prevState]);

  return { formController, formAction };
};

export default useGroupForm;
