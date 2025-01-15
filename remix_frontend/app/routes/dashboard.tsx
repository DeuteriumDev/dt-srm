import Button from '~/components/Button';
import type { Route } from './+types/dashboard';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Dashboard' },
    { name: 'description', content: 'Graph Table: Dashboard page' },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const favoriteFolders = await getUserFavoriteFolders(request);

  return favoriteFolders
}

export default function Home() {
  return (
    <div>
      dashboard
      <Button onClick={console.log}>test</Button>
    </div>
  );
}
