import { proxy } from "~/data/convexProxy/index.server"
import { api } from "@/_generated/api";
import { type WorldId } from "@/worlds"
import type {
  SceneId, InsertArgs, UpdateArgs, DeleteArgs,
  SetBlockerLayersArgs, SetCustomLayersArgs, UpdateTimeArgs
} from "@/world/scenes";

// import { parseNotFoundRecordError, parseConvexError } from "@/error";

export const getWorldScene = async (id: SceneId) => {
  return await proxy().query(api.world.scenes.read, { id })
}

export const getWorldSceneExtend = async (id: SceneId) => {
  return await proxy().query(api.world.scenes.readEx, { id })
}

export const listWorldScenes = async (worldId: WorldId) => {
  const scenes = await proxy().query(api.world.scenes.list, { worldId })
  return scenes
}

export const createWorldScene = async (args: InsertArgs) => {
  const newSceneId = await proxy().mutation(api.world.scenes.create, args)
  return newSceneId
}

export const updateWorldScene = async (args: UpdateArgs) => {
  await proxy().mutation(api.world.scenes.update, args)
}

export const deleteWorldScene = async (args: DeleteArgs) => {
  await proxy().mutation(api.world.scenes.delete_, args)
}

export const setSceneBlockerLayers = async (args: SetBlockerLayersArgs) => {
  await proxy().mutation(api.world.scenes.setBlockerLayers, args)
}

export const setSceneCustomLayers = async (args: SetCustomLayersArgs) => {
  await proxy().mutation(api.world.scenes.setCustomLayers, args)
}

export const updateSceneSyncTime = async (args: UpdateTimeArgs) => {
  await proxy().mutation(api.world.scenes.updateSyncTime, args)
}