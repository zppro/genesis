import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Globe,
  Music,
  SquareUserRound,
  LucideProps,
  type LucideIcon,
} from "lucide-react"
import { useUser } from "@clerk/remix";
import { NavMain, type NavItem } from "~/components/nav-main"
import { NavProjects } from "~/components/nav-projects"
import { NavUser } from "~/components/nav-user"
import { WorldSwitcher } from "~/components/world-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "~/components/ui/sidebar"
import type { SerializedWorld } from "@/worlds"
import { Doc } from "@/_generated/dataModel"
// This is sample data.
const data = {
  worlds: [
    {
      name: "ai-town",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "steampunk",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "minecrate",
      logo: Command,
      plan: "Free",
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
  ],
}

const DotIcon = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
      <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512z" />
    </svg>
  )
}



export function AppSidebar({ navMain, worlds, ...props }: React.ComponentProps<typeof Sidebar> & { navMain: NavItem[], worlds: Doc<"worlds">[] }) {
  const { isSignedIn, user } = useUser()
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <WorldSwitcher worlds={worlds} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        {isSignedIn && <NavUser user={user} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
