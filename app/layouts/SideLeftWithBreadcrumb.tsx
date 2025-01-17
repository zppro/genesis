import type { NavItem } from "~/components/nav-main"
import { AppSidebar } from "~/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb"
import { Handle } from "~/lib/routeHandle";
import { Separator } from "~/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar"
import { useMatches, useLocation } from "@remix-run/react"
import { Fragment } from "react";


export default function Layout({ children, navMain }: { children: React.ReactNode, navMain: NavItem[] }) {
  const matches = useMatches();
  const location = useLocation();

  function setActiveItems() {
    let matchNavItem = navMain.find(item => {
      return location.pathname.startsWith(item.url) || item.items?.some(subItem => location.pathname.startsWith(subItem.url))
    })
    if (!matchNavItem) {
      matchNavItem = navMain[0];
    }
    matchNavItem.isActive = true
    let matchNavSubItem = matchNavItem.items?.find(subItem => location.pathname.startsWith(subItem.url))
    if (!matchNavSubItem) {
      matchNavSubItem = matchNavItem.items?.[0]
    }
    if (matchNavSubItem) {
      matchNavSubItem.isActive = true;
    }
  }
  setActiveItems()

  return (
    <SidebarProvider>
      <AppSidebar navMain={navMain} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {
                  matches
                    .filter(
                      (match) =>
                        match.handle && (match.handle as Handle).breadcrumb
                    )
                    .map((match, index) => (
                      <Fragment key={match.id}>
                        {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                        {(match.handle as Handle).breadcrumb(match, location.pathname === match.pathname)}
                      </Fragment>
                    ))
                }
                {/* <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>

                <BreadcrumbSeparator className="hidden md:block" />

                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem> */}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <Separator />
        <div className="flex flex-1 flex-col gap-4 p-0">
          {children}
        </div>
      </SidebarInset >
    </SidebarProvider >
  )
}
