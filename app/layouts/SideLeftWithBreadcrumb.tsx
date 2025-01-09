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
import type { WorldDoc, WorldId } from "@/worlds";



export default function Layout({ children, navMain, worlds }: { children: React.ReactNode, navMain: NavItem[], worlds: WorldDoc[] }) {
  const matches = useMatches();
  const location = useLocation();
  
  return (
    <SidebarProvider>
      <AppSidebar navMain={navMain} worlds={worlds} />
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
                      <>
                        {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                        {(match.handle as Handle).breadcrumb(match, location.pathname === match.pathname)}
                      </>
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
