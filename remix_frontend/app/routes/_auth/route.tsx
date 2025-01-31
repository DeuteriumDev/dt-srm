import { data, Link, Outlet } from 'react-router';
import { Home, FileText, Component, ChevronsUpDown } from 'lucide-react';

import {
  SidebarInset,
  SidebarMenuButton,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  Sidebar,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
} from '~/components/sidebar';
import { Separator } from '~/components/separator';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from '~/components/breadcrumb';
import api from '~/libs/api.server';
import sessionManager from '~/libs/session.server';

import type { Route } from '../_auth/+types/route';
import { DropdownMenu } from '~/components/dropdown-menu';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/avatar';

export async function loader(args: Route.LoaderArgs) {
  const [getHeaders, cookie] = await sessionManager.getOrRefreshCookie(
    args.request,
  );
  const me = await api.usersMeRetrieve({
    headers: {
      Authorization: `Bearer ${cookie.get('access_token')}`,
    },
  });

  return data(
    { usersMeRetrieve: me.data, path: new URL(args.request.url).pathname },
    getHeaders(),
  );
}

export default function Layout({ loaderData }: Route.ComponentProps) {
  const paths = loaderData.path.split('/');
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="">
          <SidebarMenuButton asChild>
            <Link to="/dashboard#" className="flex items-center gap-2">
              <Component />
              <span className="text-lg font-bold">Graph Table</span>
            </Link>
          </SidebarMenuButton>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="p-2 gap-2">
            <SidebarMenuButton
              asChild
              isActive={loaderData.path.startsWith('/dashboard')}
            >
              <Link
                to="/dashboard"
                className="flex items-center gap-2 font-semibold"
              >
                <Home />
                <span className="">Dashboard</span>
              </Link>
            </SidebarMenuButton>
            <SidebarMenuButton
              asChild
              isActive={loaderData.path.startsWith('/documents')}
            >
              <Link
                to="/documents"
                className="flex items-center gap-2 font-semibold"
              >
                <FileText />
                <span className="">Documents</span>
              </Link>
            </SidebarMenuButton>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={loaderData.usersMeRetrieve?.avatar || undefined}
                        alt={loaderData.usersMeRetrieve?.email}
                      />
                      <AvatarFallback className="rounded-lg">
                        {`${(loaderData.usersMeRetrieve?.first_name || 'A').charAt(0)}${(loaderData.usersMeRetrieve?.first_name || 'A').charAt(0)}`}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {loaderData.usersMeRetrieve?.email}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {paths.map((subPath, index) => (
                  <div key={subPath}>
                    <BreadcrumbItem className="hidden md:block capitalize">
                      <BreadcrumbLink asChild>
                        <Link
                          to={[...paths.slice(0, index), subPath].join('/')}
                        >
                          {subPath}
                        </Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {index + 1 !== paths.length && (
                      <BreadcrumbSeparator className="hidden md:block" />
                    )}
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
