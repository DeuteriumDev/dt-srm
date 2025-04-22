import usePreviousValue from 'beautiful-react-hooks/usePreviousValue';
import _ from 'lodash';
import { useState, useEffect } from 'react';
import { useFetcher, useNavigate, useSearchParams } from 'react-router';

import { type Route } from '../_auth.$content_type.delete.$id/+types/route';
import actionServer from './action.server';
import loaderServer from './loader.server';

import { Button } from '~/components/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/dialog';
import { Separator } from '~/components/separator';

import { useToast } from '~/hooks/use-toast';
import { RequestHelper } from '~/libs/request';
import { singularize } from '~/libs/words';

export { actionServer as action, loaderServer as loader };

export function meta(args: Route.MetaArgs) {
  return [
    { title: `Delete ${args.params.content_type}` },
    {
      name: 'description',
      content: `Graph Table: Delete ${args.params.content_type} page`,
    },
  ];
}

export default function DeleteModal(props: Route.ComponentProps) {
  const {
    params: { content_type },
    loaderData,
  } = props;
  const nav = useNavigate();
  const { toast } = useToast();
  const [searchParams, _setSearchParams] = useSearchParams();
  const name =
    (loaderData as { contentData: { name: string } })?.contentData?.name ||
    (loaderData as { contentData: { email: string } })?.contentData?.email;

  const deleteAction = useFetcher();
  const [open, setOpen] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const prev = usePreviousValue(submitting);

  const _handleClose = () => {
    setOpen(false);
  };

  const _handleSubmit = (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setSubmitting(true);
    deleteAction
      .submit(null, { method: 'DELETE' })
      .then(() => setSubmitting(false))
      .catch(console.error);
  };

  useEffect(() => {
    if (prev && !submitting) {
      if (deleteAction.data?.error) {
        toast({
          title: 'Error',
          description: deleteAction.data.error,
          variant: 'destructive',
        });
      } else {
        _handleClose();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitting, prev]);

  return (
    <Dialog open={open} onOpenChange={_handleClose}>
      <DialogContent
        onCloseAutoFocus={() => {
          // nav after animation finishes
          return nav(
            `/${content_type}?${RequestHelper.parseSearchParams(
              RequestHelper.URLSearchParamsTo(searchParams),
            )}`,
          );
        }}
        onEscapeKeyDown={_handleClose}
        className="flex h-1/3 w-[540px] flex-col sm:w-[540px] sm:max-w-none"
      >
        <DialogHeader className="grid gap-4 py-4">
          <DialogTitle>{`Delete ${singularize(content_type)}: "${name}"`}</DialogTitle>
        </DialogHeader>
        <Separator />
        <p>{`Are you sure you want to delete this ${singularize(content_type)}?`}</p>
        <Separator />
        <DialogFooter className="mt-auto flex justify-end py-4">
          <Button onClick={_handleClose}>Cancel</Button>
          <Button
            onClick={_handleSubmit}
            disabled={submitting}
            variant="destructive"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
