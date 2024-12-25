import { ObjectType, v } from 'convex/values';
import { idWorld } from '../worlds';
import { defineTable } from "convex/server";
import { mutation, query } from '../_generated/server';
import { Doc, Id } from "../_generated/dataModel";
import { idStorage, StorageId } from "../shared/storage"

export const table = 'textures';
export const indexName_ByWorldId = 'byWorldId';
export const idTexture = v.id(table);

export const textureSerialized = {
  name: v.string(),
  worldId: idWorld,
  // The speed of the animation. Can be tuned depending on the side and speed of the NPC.
  storageId: idStorage,
  url: v.string(),
};


const { url: _url, ...insertArgs } = textureSerialized
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
    const url = await ctx.storage.getUrl(args.storageId)
    return await ctx.db.insert(table, { ...args, url: url ?? "" });
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
      throw new Error(`Invalid \`${table}\` ID: ${args.id}`);
    }
    if (args.storageId !== entity.storageId) {
      const url = await ctx.storage.getUrl(args.storageId);
      await ctx.db.patch(id, { ...patchData, url: url ?? "" });
      await ctx.storage.delete(entity.storageId)
      // 删除旧的stoargeId
    } else {
      await ctx.db.patch(id, patchData);
    }
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
    await ctx.db.delete(id);
    await ctx.storage.delete(entity.storageId)
  },
});