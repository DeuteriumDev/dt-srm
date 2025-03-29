import {
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import {
  Home,
  FileText,
  Component,
  ChevronsUpDown,
  LogOut,
} from 'lucide-react';
import { data, Link, Outlet } from 'react-router';
import { type Route } from '../_auth/+types/route';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/avatar';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '~/components/dropdown-menu';
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
import api from '~/libs/api.server';
import { RequestHelper } from '~/libs/request';
import sessionManager from '~/libs/session.server';

export async function loader(args: Route.LoaderArgs) {
  const [getHeaders, cookie] = await sessionManager.getOrRefreshCookie(
    args.request,
  );
  try {
    const me = await api.usersMeRetrieve({
      headers: {
        Authorization: `Bearer ${cookie.get(sessionManager.SESSION_access_token)}`,
      },
      throwOnError: true,
    });
    const searchParams = new RequestHelper(args.request).getSearchParams();
    return data(
      {
        usersMeRetrieve: me.data,
        path: new RequestHelper(args.request).pathname,
        searchParams,
      },
      getHeaders(),
    );
  } catch (error) {
    sessionManager.revalidateSession(args.request, error as { detail: string });
  }
}

export default function Layout({ loaderData }: Route.ComponentProps) {
  const usersMeRetrieve = loaderData?.usersMeRetrieve;

  const fallbackName = `${(usersMeRetrieve?.first_name || 'A').charAt(0)}${(usersMeRetrieve?.first_name || 'A').charAt(0)}`;

  const menuItemStyling =
    'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0';
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
          <SidebarGroup className="gap-2 p-2">
            <SidebarMenuButton
              asChild
              isActive={loaderData?.path.startsWith('/dashboard')}
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
              isActive={loaderData?.path.startsWith('/documents')}
            >
              <Link
                to={`/documents?${RequestHelper.parseSearchParams({ parent__isnull: true, page: 1, ordering: 'name' })}`}
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
                        src={usersMeRetrieve?.avatar || undefined}
                        alt={usersMeRetrieve?.email}
                      />
                      <AvatarFallback className="rounded-lg">
                        {fallbackName}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {usersMeRetrieve?.email}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="right"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage
                          src={usersMeRetrieve?.avatar || undefined}
                          alt={usersMeRetrieve?.email}
                        />
                        <AvatarFallback className="rounded-lg">
                          {fallbackName}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {`${usersMeRetrieve?.first_name} ${usersMeRetrieve?.last_name}`}
                        </span>
                        <span className="truncate text-xs">
                          {usersMeRetrieve?.email}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className={menuItemStyling} asChild>
                    <Link to="/logout">
                      <LogOut />
                      Log out
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
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
          </div>
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
