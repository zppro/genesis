import {
  Map,
  Settings2,
  Globe,
  Music,
  SquareUserRound,
  LucideProps,
} from "lucide-react"
import type { NavItem } from "~/components/nav-main"


export const appNavItems: NavItem[] = [
  {
    title: "Scenes",
    url: "#",
    icon: Globe,
    isActive: true,
    items: [
      {
        title: "scene",
        url: "#",
      },
      {
        title: "map",
        url: "#",
      },
      {
        title: "music",
        url: "#",
      },
    ],
  },
  {
    title: "Characters",
    url: "#",
    icon: SquareUserRound,
    items: [
      {
        title: "Genesis",
        url: "#",
      },
      {
        title: "Explorer",
        url: "#",
      },
      {
        title: "Quantum",
        url: "#",
      },
    ],
  },
  {
    title: "Maps",
    url: "#",
    icon: Map,
    items: [
      {
        title: "Introduction",
        url: "#",
      },
      {
        title: "Get Started",
        url: "#",
      },
      {
        title: "Tutorials",
        url: "#",
      },
      {
        title: "Changelog",
        url: "#",
      },
    ],
  },
  {
    title: "Musics",
    url: "#",
    icon: Music,
    items: [
      {
        title: "Introduction",
        url: "#",
      },
      {
        title: "Get Started",
        url: "#",
      },
      {
        title: "Tutorials",
        url: "#",
      },
      {
        title: "Changelog",
        url: "#",
      },
    ],
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings2,
    items: [
      {
        title: "General",
        url: "#",
      },
      {
        title: "Team",
        url: "#",
      },
      {
        title: "Billing",
        url: "#",
      },
      {
        title: "Limits",
        url: "#",
      },
    ],
  },
]