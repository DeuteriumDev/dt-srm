import Button from '~/components/Button';

import type { Route } from './+types/login';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Login' },
    { name: 'description', content: 'Graph Table: Login page' },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const body = await request.formData();

  return favoriteFolders;
}

export default function Login() {
  return (
    <div>
      dashboard
      <Button onClick={console.log}>test</Button>
    </div>
  );
}
