import _ from 'lodash';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useFetcher, data } from 'react-router';
import { z, ZodError } from 'zod';

import { type Route } from '../login/+types/route';
import { Alert, AlertTitle, AlertDescription } from '~/components/alert';
import { Button } from '~/components/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/dialog';
import { Input } from '~/components/input';
import { Label } from '~/components/label';
import { RequestHelper } from '~/libs/request';
import sessionManager from '~/libs/session.server';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Login' },
    { name: 'description', content: 'Graph Table: Login page' },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const body = await request.formData();
  try {
    const result = z
      .object({
        username: z
          .string({ message: 'email is required' })
          .email({ message: 'invalid email' }),
        password: z
          .string({ message: 'password is required' })
          .min(3, { message: 'password must contain at least 3 characters' }),
      })
      .required()
      .parse({
        username: body.get('username'),
        password: body.get('password'),
      });

    const params = new RequestHelper(request).getSearchParams<{
      redirect?: string;
    }>();
    return await sessionManager.login({
      ...result,
      request,
      redirectTo: params.redirect || '/dashboard',
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const errorData = error.issues.reduce(
        (error, issue) => ({
          ...error,
          [issue.path[0]]: issue.message,
        }),
        {},
      );
      return data(errorData, { status: 400 });
    }
    if (error instanceof sessionManager.OAuthError) {
      return data({ form: error.message }, { status: 400 });
    }
    throw error;
  }
}

export default function Login() {
  const fetcher = useFetcher();

  const _displayError = (error: 'username' | 'password') => {
    return (
      _.get(fetcher.data, error) && (
        <div className="col-span-4">
          <p id="email-error" className="text-sm text-red-600">
            {_.get(fetcher.data, error)}
          </p>
        </div>
      )
    );
  };

  const loading = fetcher.state !== 'idle';

  return (
    <Dialog open>
      <DialogContent hideCloseButton>
        <fetcher.Form method="post">
          <DialogHeader>
            <DialogTitle>Login</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 content-center items-center gap-4">
              {fetcher.data?.form && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{fetcher.data?.form}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Email
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                className="col-span-3"
                placeholder="m@example.com"
                disabled={loading}
              />
            </div>
            {_displayError('username')}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                name="password"
                className="col-span-3"
                disabled={loading}
              />
              {_displayError('password')}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && (
                <>
                  <Loader2 className="animate-spin" />
                  Please wait
                </>
              )}
              {!loading && 'Login'}
            </Button>
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}
