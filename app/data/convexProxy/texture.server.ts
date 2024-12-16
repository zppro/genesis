import { proxy } from "~/data/convexProxy/index.server"
import { api } from "@/_generated/api";
import { type WorldId } from "@/worlds"
import type { TextureId, InsertArgs, UpdateArgs, DeleteArgs } from "@/world/textures";

export const getWorldTexture = async (id: TextureId) => {
  return await proxy().query(api.world.textures.read, { id })
}

export const listWorldTextures = async (worldId: WorldId) => {
  return await proxy().query(api.world.textures.list, { worldId })
}

export const createWorldTexture = async (args: InsertArgs) => {
  return await proxy().mutation(api.world.textures.create, { ...args })
}

export const updateWorldTexture = async (args: UpdateArgs) => {
  await proxy().mutation(api.world.textures.update, args)
}

export const deleteWorldTexture = async (args: DeleteArgs) => {
  await proxy().mutation(api.world.textures.delete_, args)
}