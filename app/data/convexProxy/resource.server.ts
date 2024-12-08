import { proxy } from "~/data/convexProxy/index.server"
import { api } from "@/_generated/api";
import { type WorldId } from "@/worlds"
import type { ResourceId, ResourceTypes, InsertArgs, UpdateArgs, DeleteArgs } from "@/world/resources";
// import { parseNotFoundRecordError, parseConvexError } from "@/error";


// export const generateUploadUrl = async () => {
//   return await proxy().mutation(api.world.resources.generateUploadUrl)
// }

export const getWorldResource = async (id: ResourceId) => {
  return await proxy().query(api.world.resources.read, { id })
}

export const listWorldResourcsByType = async (worldId: WorldId, type: ResourceTypes) => {
  const scenes = await proxy().query(api.world.resources.list, { worldId, type })
  return scenes
}

export const createWorldResource = async (args: InsertArgs) => {
  const newResourceId = await proxy().mutation(api.world.resources.create, { ...args })
  return newResourceId
}

export const updateWorldResource = async (args: UpdateArgs) => {
  await proxy().mutation(api.world.resources.update, args)
}

export const deleteWorldResource = async (args: DeleteArgs) => {
  await proxy().mutation(api.world.resources.delete_, args)
}