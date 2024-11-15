"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  UserCog2
} from "lucide-react"
import type { UserResource } from "@clerk/types"

import { UserProfile } from '@clerk/remix'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar"

import { useEnv } from "~/hooks/use-env"
import { useNavigate, useNavigation } from "@remix-run/react"
import { useState } from "react"

function onUserCogClick(CLERK_PUBLISHABLE_KEY: string) {

  console.log('clerk publish key=>', CLERK_PUBLISHABLE_KEY)

}


export function NavUser({
  user,
}: {
  user: UserResource
}) {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const env = useEnv()
  const { isMobile } = useSidebar()
  const email = user.primaryEmailAddress?.emailAddress
  const username = email?.split("@")[0]
  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.imageUrl} alt={username} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{username ?? ""}</span>
                  <span className="truncate text-xs">{email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.imageUrl} alt={username} />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{username}</span>
                    <span className="truncate text-xs">{email}</span>
                  </div>
                  <button onClick={() => {
                    onUserCogClick(env.CLERK_PUBLISHABLE_KEY)
                  }} >
                    <UserCog2 size={16} />
                  </button>

                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Sparkles />
                  Upgrade to Pro
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <BadgeCheck />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CreditCard />
                  Billing
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell />
                  Notifications
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsOpen(true)} >
                  <UserCog2 />Settings
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger></DialogTrigger>
        <DialogContent className={"lg:max-w-screen-lg overflow-y-scroll max-h-screen flex justify-center items-center"}>
          <UserProfile />
        </DialogContent>
      </Dialog>
    </>

  )
}
