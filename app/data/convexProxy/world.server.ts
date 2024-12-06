import { proxy } from "~/data/convexProxy/index.server"
import { api } from "@/_generated/api";

export const hasNoWorld = async () => {
  const worlds = await listWorlds()
  return worlds.length === 0
}

export const listWorlds = async () => {
  const worlds = await proxy().query(api.worlds.list)
  return worlds
}
