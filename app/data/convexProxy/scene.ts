import { queryProxy } from "~/data/convexProxy"
import { api } from "@/_generated/api";
import { type WorldId } from "@/worlds"

export const listWorldScenes = async (worldId: WorldId) => {
  const worlds = await queryProxy().query(api.world.scenes.list, { worldId })
  return worlds
}
