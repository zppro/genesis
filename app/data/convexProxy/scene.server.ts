import { proxy } from "~/data/convexProxy/index.server"
import { api } from "@/_generated/api";
import { type WorldId } from "@/worlds"
import type { SceneId, InsertArgs, DeleteArgs } from "@/world/scenes";
// import { parseNotFoundRecordError, parseConvexError } from "@/error";

export const getWorldScene = async (id: SceneId) => {
  const scene = await proxy().query(api.world.scenes.read, { id })
  return scene
}

export const listWorldScenes = async (worldId: WorldId) => {
  const scenes = await proxy().query(api.world.scenes.list, { worldId })
  return scenes
}

export const createWorldScene = async (args: InsertArgs) => {
  const newSceneId = await proxy().mutation(api.world.scenes.create, args)
  return newSceneId
}

export const deleteWorldScene = async (args: DeleteArgs) => {
  await proxy().mutation(api.world.scenes.delete_, args)
}