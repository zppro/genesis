import * as React from "react"
import { ChevronsUpDown, Plus, Globe } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar"
import { useLocalStorage } from "~/hooks/use-localStorage"
import { type WorldDoc } from "@/worlds"

export function WorldSwitcher({
  worlds,
}: {
  worlds: WorldDoc[]
}) {
  const { isMobile } = useSidebar()
  const [localWorldId, setLocalWorldId] = useLocalStorage("localWorldId", "")
  let defaultWorld = worlds.length > 0 ? worlds[0] : null;
  if (localWorldId) {
    defaultWorld = worlds.find(w => w._id === localWorldId) ?? defaultWorld
  }
  const [activeWorld, setActiveWorld] = React.useState(defaultWorld)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                {/* <activeWorld.logo className="size-4" /> */}
                {<Globe className="size-4" />}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeWorld?.name}
                </span>
                <span className="truncate text-xs">{activeWorld?.desc ?? "--"}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Worlds
            </DropdownMenuLabel>
            {worlds.map((world, index) => (
              <DropdownMenuItem
                key={world.name}
                onClick={() => setActiveWorld(world)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  {/* <world.logo className="size-4 shrink-0" /> */}
                  {<Globe className="size-4 shrink-0" />}
                </div>
                {world.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Add world</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
