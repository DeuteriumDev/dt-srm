import { Link, Outlet } from 'react-router';
import { Home, FileText, Component } from 'lucide-react';

import { Nav } from '~/components/Nav';
import type { Route } from '../_auth/+types/route';

export default function Layout(_args: Route.ComponentProps) {
  return (
    <>
      <div className="bg-muted/40 hidden border-r md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <Component className="size-6" />
              <span className="">Graph Table</span>
            </Link>
          </div>
          <Nav
            links={[
              {
                title: 'Dashboard',
                icon: Home,
                variant: 'default',
                href: '/dashboard',
              },
              {
                title: 'Documents',
                icon: FileText,
                variant: 'default',
                href: '/documents',
              },
            ]}
          />
        </div>
      </div>
      <div className="flex flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <Outlet />
        </main>
      </div>
    </>
  );
}
