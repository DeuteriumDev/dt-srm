import _ from 'lodash';
import { Outlet } from 'react-router';

import loader from './loader.server';

import DataTable from '~/components/datatable';
import useGroupsTable from '~/hooks/use-groups-table';

export { loader };

export default function Groups() {
  const { controller, fetcher } = useGroupsTable();

  return (
    <div>
      <DataTable controller={controller} fetcher={fetcher} />
      <Outlet />
    </div>
  );
}
