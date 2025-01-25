import { z, ZodError } from 'zod';
import { redirect, useFetcher, data } from 'react-router';

import Button from '~/components/Button';
import { login, OAuthError } from '~/libs/api.server';
import Input from '~/components/Input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/Dialog';
import Label from '~/components/Label';

import type { Route } from './+types/route';
import _ from 'lodash';

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

    const redirectParam = new URL(request.url).searchParams.get('redirect');
    return await login({
      ...result,
      request,
      redirectTo: redirectParam || '/dashboard',
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
    if (error instanceof OAuthError) {
      return data({ form: error.message }, { status: 400 });
    }
    throw error;
  }
}

export default function Login() {
  const fetcher = useFetcher();
  console.log(fetcher);

  const _displayError = (error: 'username' | 'password' | 'form') => {
    return (
      _.get(fetcher.data, error) && (
        <div className="col-span-4">
          <p id="email-error" className=" text-sm text-red-600 ">
            {_.get(fetcher.data, error)}
          </p>
        </div>
      )
    );
  };

  return (
    <Dialog open>
      <DialogContent hideCloseButton>
        <fetcher.Form method="post">
          <DialogHeader>
            <DialogTitle>Login</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4 content-center">
              {_displayError('form')}
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
              />
              {_displayError('password')}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Login</Button>
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}
