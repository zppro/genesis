import { queryProxy } from "~/data/convexProxy"
import { api } from "@/_generated/api";

export const hasNoWorld = async () => {
  const worlds = await listWorlds()
  return worlds.length === 0
}

export const listWorlds = async () => {
  const worlds = await queryProxy().query(api.worlds.list)
  return worlds
}
