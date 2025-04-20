import usePreviousValue from 'beautiful-react-hooks/usePreviousValue';
import _ from 'lodash';
import { useEffect } from 'react';
import { useFetcher } from 'react-router';

import useAppForm from '~/hooks/use-app-form';
import { useToast } from '~/hooks/use-toast';
import type apiRest from '~/libs/api.server';
import validation from '~/libs/validation';

const FAVORITE_DEFAULT = false;
const INHERIT_DEFAULT = true;

const useFolderForm = (targetFolder: apiRest.Folder, onFinish: () => any) => {
  const formAction = useFetcher();
  const prevState = usePreviousValue(formAction.state);
  const { toast } = useToast();

  const formController = useAppForm({
    defaultValues: {
      name: targetFolder.name,
      parent: targetFolder.parent,
      description: targetFolder.description,
      favorite: targetFolder.favorite || FAVORITE_DEFAULT,
      inherit_permissions: targetFolder.inherit_permissions || INHERIT_DEFAULT,
    } as apiRest.FolderRequest,
    validators: {
      onChange: validation.zFolderRequest,
    },
    onSubmit: async ({ value }) => {
      await formAction.submit(_.omit(value, ['groups']), {
        method: 'POST',
      });
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

export default useFolderForm;
