import { ObjectType, v, ConvexError } from 'convex/values';
import { idWorld } from '../worlds';
import { defineTable } from "convex/server";
import { mutation, query } from '../_generated/server';
import { api, internal } from "../_generated/api";
import { Doc, Id } from "../_generated/dataModel";
import { idStorage, StorageId } from "../shared/storage"

export const table = 'textures';
export const indexName_ByWorldId = 'byWorldId';
export const idTexture = v.id(table);

export const textureSerialized = {
  modifyTime: v.number(),
  name: v.string(),
  worldId: idWorld,
  // The speed of the animation. Can be tuned depending on the side and speed of the NPC.
  storageId: idStorage,
  url: v.string(),
};


const { modifyTime, url: _url, ...insertArgs } = textureSerialized
const { worldId: _, ..._updateArgs } = insertArgs
const updateArgs = { id: idTexture, ..._updateArgs }
const deleteArgs = { id: idTexture }

export type TextureTable = typeof table
export type TextureId = Id<TextureTable>
export type TextureDoc = Doc<TextureTable>
export type SerializedTexture = ObjectType<typeof textureSerialized>;
export type InsertArgs = ObjectType<typeof insertArgs>;
export type UpdateArgs = ObjectType<typeof updateArgs>;
export type DeleteArgs = ObjectType<typeof deleteArgs>;

export const tableSchema = defineTable(textureSerialized)
  .index(indexName_ByWorldId, ["worldId"])


export const create = mutation({
  args: insertArgs,
  handler: async (ctx, args) => {
    const modifyTime = +new Date()
    const url = await ctx.storage.getUrl(args.storageId)
    return await ctx.db.insert(table, { ...args, url: url ?? "", modifyTime });
  },
});

export const read = query({
  args: { id: idTexture },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const list = query({
  args: { worldId: idWorld },
  handler: async (ctx, args) => {
    const { worldId } = args
    return await ctx.db.query(table).withIndex(indexName_ByWorldId, (q) =>
      q
        .eq("worldId", worldId)
    ).collect();
  },
})

export const update = mutation({
  args: updateArgs,
  handler: async (ctx, args) => {
    const { id, ...patchData } = args
    const entity = await ctx.db.get(id);
    if (!entity) {
      throw new ConvexError(`Invalid \`${table}\` ID: ${args.id}`);
    }
    const modifyTime = +new Date()
    if (args.storageId !== entity.storageId) {
      const url = await ctx.storage.getUrl(args.storageId);
      await ctx.db.patch(id, { ...patchData, url: url ?? "", modifyTime });
      await ctx.storage.delete(entity.storageId)
      // 删除旧的stoargeId
    } else {
      await ctx.db.patch(id, {...patchData, modifyTime});
    }

    // make ref entity updateModifyTime
    const spritesheets = await ctx.runQuery(api.world.spritesheets.listByTexture, { worldId: entity.worldId, textureId: entity._id })
    await Promise.all(spritesheets.map(async (spritesheet) => {
      await ctx.runMutation(internal.world.spritesheets.updateModifyTime, { id: spritesheet._id })
    }))
  },
});

export const delete_ = mutation({
  args: deleteArgs,
  handler: async (ctx, args) => {
    const { id } = args
    const entity = await ctx.db.get(id);
    if (!entity) {
      throw new Error(`Invalid \`${table}\` ID: ${args.id}`);
    }
    const spritesheets = await ctx.runQuery(api.world.spritesheets.listByTexture, { worldId: entity.worldId, textureId: entity._id })
    if (spritesheets.length > 0) {
      throw new ConvexError(`current texture reference by spritesheets:[${spritesheets.map(v=>v.name).join()}]`);
    }
    await ctx.db.delete(id);
    await ctx.storage.delete(entity.storageId)
  },
});