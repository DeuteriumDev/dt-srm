import _ from 'lodash';
import { AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { type Route } from '../_auth.$ctype.$id_/+types/route';
import actionServer from './action.server';
import loaderServer from './loader.server';

import { Alert, AlertDescription, AlertTitle } from '~/components/alert';
import DataSheet from '~/components/data-sheet';
import useFolderForm from '~/hooks/use-folders-form';
import useGroupForm from '~/hooks/use-groups-form';
import useSearchParams from '~/hooks/use-search-params';
import { singularize } from '~/libs/words';

const HOOK_MAP = {
  groups: useGroupForm,
  // users: useU,
  folders: useFolderForm,
};

export { actionServer as action, loaderServer as loader };

export function meta(args: Route.MetaArgs) {
  return [
    {
      title: `${singularize(args.params.ctype)}: ${_.get(args, 'data.name') || _.get(args, 'data.email') || 'Not Found'}`,
    },
    { name: 'description', content: 'Graph Table: Folder page' },
  ];
}

export default function EditCtype(props: Route.ComponentProps) {
  const {
    params: { ctype },
    loaderData,
  } = props;
  const { toString } = useSearchParams();
  const nav = useNavigate();
  const [open, setOpen] = useState(true);

  if (!Object.keys(HOOK_MAP).includes(ctype)) {
    return (
      <div className="m-4 flex justify-center rounded border border-red-500 p-4 text-center">
        <p className="italic text-red-500">{`Invalid ctype: ${ctype}`}</p>
      </div>
    );
  }

  const _handleClose = () => {
    setOpen(false);
  };
  type DataArg = Parameters<(typeof HOOK_MAP)['folders']>[0] &
    Parameters<(typeof HOOK_MAP)['groups']>[0];
  const { formController, fields } = HOOK_MAP[ctype as keyof typeof HOOK_MAP](
    loaderData.data as DataArg,
    _handleClose,
  );

  const _handleSubmit = (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    formController.handleSubmit().catch(console.error);
  };

  const name =
    _.get(loaderData, 'data.name') || _.get(loaderData, 'data.email');

  return (
    <formController.Subscribe
      selector={(state) =>
        state.isSubmitting || state.isValidating || !_.isEmpty(state.errors)
      }
    >
      {(disabled) => (
        <DataSheet
          open={open}
          onClose={_handleClose}
          onCloseAnimation={() => nav(`/${ctype}?${toString()}`)}
          title={`Edit ${singularize(ctype)}: "${name}"`}
          body={
            <form
              className="space-y-4 overflow-y-auto py-4"
              onSubmit={_handleSubmit}
            >
              {_.has(formController, 'data.error') && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>Server error</AlertDescription>
                </Alert>
              )}
              {fields}
            </form>
          }
          onSave={_handleSubmit}
          disabled={disabled}
        />
      )}
    </formController.Subscribe>
  );
}
