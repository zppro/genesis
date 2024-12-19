import { WorldId } from "@/worlds"
import {
  Map,
  Settings2,
  Globe,
  Music,
  SquareUserRound,
  Sword,
  Boxes
} from "lucide-react"
import type { NavItem } from "~/components/nav-main"

export const appNavItems = (worldId: WorldId) => {
  const baseUrl = `/world/${worldId}`
  return [
    {
      title: "Scenes",
      url: "#",
      icon: Globe,
      isActive: true,
      items: [
        {
          title: "scene",
          url: `${baseUrl}/scene`,
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
      title: "Maps",
      url: "#",
      icon: Map,
      items: [
        {
          title: "TileSets",
          url: `${baseUrl}/resource/tileset`,
        },
        {
          title: "TileMaps",
          url: `${baseUrl}/resource/tilemap`,
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
      title: "Characters & Objs",
      url: "#",
      icon: SquareUserRound,
      items: [
        {
          title: "character",
          url: `${baseUrl}/character`,
        },
        {
          title: "object",
          url: `${baseUrl}/object`,
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Materials",
      url: "#",
      icon: Boxes,
      items: [
        {
          title: "Textures",
          url: `${baseUrl}/texture`,
        },
        {
          title: "Spritesheets",
          url: `${baseUrl}/spritesheet`,
        },
      ],
    },
    {
      title: "Items",
      url: "#",
      icon: Sword,
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
          url: `${baseUrl}/settings`,
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
}

export const appNavItems2: NavItem[] = [
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
    title: "Maps",
    url: "#",
    icon: Map,
    items: [
      {
        title: "Map",
        url: "/world",
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
    title: "Items",
    url: "#",
    icon: Sword,
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