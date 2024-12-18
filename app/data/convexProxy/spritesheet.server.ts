import { proxy } from "~/data/convexProxy/index.server"
import { api } from "@/_generated/api";
import { type WorldId } from "@/worlds";
import { type TextureId } from "@/world/textures";
import type { SpritesheetId, InsertArgs, UpdateArgs, DeleteArgs } from "@/world/spritesheets";

export const getWorldSpritesheet = async (id: SpritesheetId) => {
  return await proxy().query(api.world.spritesheets.read, { id })
}

export const listWorldSpritesheets = async (worldId: WorldId) => {
  return await proxy().query(api.world.spritesheets.list, { worldId })
}

export const listWorldSpritesheetExtends = async (worldId: WorldId) => {
  return await proxy().query(api.world.spritesheets.listEx, { worldId })
}

export const listWorldSpritesheetsByTexture = async (worldId: WorldId, textureId: TextureId) => {
  return await proxy().query(api.world.spritesheets.listByTexture, { worldId, textureId })
}

export const createWorldSpritesheet = async (args: InsertArgs) => {
  return await proxy().mutation(api.world.spritesheets.create, { ...args })
}

export const updateWorldSpritesheet = async (args: UpdateArgs) => {
  await proxy().mutation(api.world.spritesheets.update, args)
}

export const deleteWorldSpritesheet = async (args: DeleteArgs) => {
  await proxy().mutation(api.world.spritesheets.delete_, args)
}