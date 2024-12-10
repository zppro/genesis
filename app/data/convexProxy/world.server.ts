import { proxy } from "~/data/convexProxy/index.server"
import { api } from "@/_generated/api";
import type { WorldId, InsertArgs, UpdateArgs, DeleteArgs } from "@/worlds";

export const hasNoWorld = async () => {
  const worlds = await listWorlds()
  return worlds.length === 0
}

export const listWorlds = async () => {
  const worlds = await proxy().query(api.worlds.list)
  return worlds
}

export const getWorld = async (id: WorldId) => {
  const scene = await proxy().query(api.worlds.read, { id })
  return scene
}

export const updateWorld = async (args: UpdateArgs) => {
  await proxy().mutation(api.worlds.update, args)
}
