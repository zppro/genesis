import { useState, useEffect } from "react"
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
import type { WorldDoc, WorldId } from "@/worlds"
import { useRootContext } from "~/hooks/use-context"
import { useRouteLoaderData, useNavigate, useFetcher, Form } from "@remix-run/react"
import type { loader as worldLoader } from "~/routes/world";
import { useRef } from "react"

export function WorldSwitcher() {
  const rootContext = useRootContext()
  const { currentWorldId } = useRouteLoaderData<typeof worldLoader>("routes/world")!;
  const navigate = useNavigate();
  // console.log("rootContext in world Switch", rootContext.worlds)
  // console.log("currentWorldId=>", currentWorldId)
  const { isMobile } = useSidebar()
  const [activeWorld, setActiveWorld] = useState<WorldDoc | null>(null)

  useEffect(() => {
    const currentWorld = rootContext.worlds.find(w => w._id === currentWorldId) ?? (rootContext.worlds.length > 0 ? rootContext.worlds[0] : null)
    setActiveWorld(currentWorld)
  }, [rootContext.worlds])

  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (activeWorld && activeWorld._id !== currentWorldId) {
      console.warn("==submiting change currentWorldId==")
      formRef.current!.submit()
    }
  }, [activeWorld])

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
            {
              activeWorld
              &&
              <Form ref={formRef} method="post" action={`/world`} >
                <input ref={inputRef} type="hidden" name="worldId" value={activeWorld!._id}></input>
              </Form>
            }
            {rootContext.worlds.map((world, index) => (
              <DropdownMenuItem
                key={world.name}
                onSelect={() => {
                  console.log("onclick")
                  setActiveWorld(world)
                }}
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
            <DropdownMenuItem className="gap-2 p-2" onClick={() => navigate(`/world/add`)}>
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
