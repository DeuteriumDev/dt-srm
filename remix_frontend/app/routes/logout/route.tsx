import { Form, Link } from 'react-router';
import { type Route } from '../logout/+types/route';
import { Button } from '~/components/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/dialog';
import { RequestHelper } from '~/libs/request';
import sessionManager from '~/libs/session.server';

export async function action(args: Route.ActionArgs) {
  new RequestHelper(args.request).validateMethods(['POST']);
  await sessionManager.logout(args.request);
}

export default function LogoutRoute() {
  return (
    <Dialog open>
      <DialogContent hideCloseButton>
        <Form method="post">
          <DialogHeader>
            <DialogTitle>Logout</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            Are you sure you want to logout?
          </div>

          <DialogFooter>
            <Button asChild>
              <Link to="/dashboard">Never mind</Link>
            </Button>
            <Button type="submit" variant="destructive">
              Logout
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
