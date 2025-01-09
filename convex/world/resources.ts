import { ObjectType, v, ConvexError } from 'convex/values';
import { idWorld } from '../worlds';
import { defineTable } from "convex/server";
import { mutation, query } from '../_generated/server';
import { Doc, Id } from "../_generated/dataModel";
import { idStorage, StorageId } from "../shared/storage"
import { api } from "../_generated/api";

export const table = 'resources';
export const indexName_ByWorldId = 'byWorldId';
export const indexName_ByWorldIdAndType = 'byWorldIdAndType';
export const idResource = v.id(table);

// tileset => tile png
// tilemap => tilemap.json
export const RESOURCE_TYPES = ['tileset', 'tilemap', 'item', 'music'] as const
const VResourceTypes = v.union(...RESOURCE_TYPES.map(t => v.literal(t)))

export const resourceSerialized = {
  modifyTime: v.number(),
  name: v.string(),
  desc: v.optional(v.string()),
  worldId: idWorld,
  type: VResourceTypes,
  storageId: idStorage,
  url: v.optional(v.string()),
};
const { modifyTime, url: _url, ...insertArgs } = resourceSerialized
const { worldId: _, type: _type, ..._updateArgs } = insertArgs
const updateArgs = { id: idResource, ..._updateArgs }
const deleteArgs = { id: idResource }

export type ResouceTable = typeof table
export type ResourceId = Id<ResouceTable>
export type ResourceDoc = Doc<ResouceTable>
export type ResourceTypes = typeof RESOURCE_TYPES[number];
export type SerializedResource = ObjectType<typeof resourceSerialized>;
export type InsertArgs = ObjectType<typeof insertArgs>;
export type UpdateArgs = ObjectType<typeof updateArgs>;
export type DeleteArgs = ObjectType<typeof deleteArgs>;

export const tableSchema = defineTable(resourceSerialized)
  .index(indexName_ByWorldId, ["worldId"])
  .index(indexName_ByWorldIdAndType, ["worldId", "type"])

// export const generateUploadUrl = mutation(async (ctx) => {
//   return await ctx.storage.generateUploadUrl();
// });

// export const generateDownloadUrl = query({
//   args: { id: idStorage },
//   handler: async (ctx, args) => {
//     return await ctx.storage.getUrl(args.id);
//   },
// });

export const create = mutation({
  args: insertArgs,
  handler: async (ctx, args) => {
    const modifyTime = +new Date()
    const url = await ctx.storage.getUrl(args.storageId) ?? undefined
    return await ctx.db.insert(table, { ...args, url, modifyTime });
  },
});

export const read = query({
  args: { id: idResource },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const list = query({
  args: { worldId: idWorld, type: VResourceTypes },
  handler: async (ctx, args) => {
    const { worldId, type } = args
    return await ctx.db.query(table).withIndex(indexName_ByWorldIdAndType, (q) =>
      q
        .eq("worldId", worldId)
        .eq("type", type)
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
    const modifyTime = +new Date()
    if (args.storageId !== entity.storageId) {
      const url = await ctx.storage.getUrl(args.storageId) ?? undefined
      await ctx.db.patch(id, { ...patchData, url, modifyTime });
      await ctx.storage.delete(entity.storageId)
      // 删除旧的stoargeId
    } else {
      await ctx.db.patch(id, { ...patchData, modifyTime });
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

    const tilesets = await ctx.runQuery(api.world.scenes.listByTilesetId, { tilesetId: id })
    if (tilesets.length > 0) {
      throw new ConvexError(`current tileset reference by scenes:[${tilesets.map(v => v.name).join()}]`);
    }
    const tilemaps = await ctx.runQuery(api.world.scenes.listByTilemapId, { tilemapId: id })
    if (tilemaps.length > 0) {
      throw new ConvexError(`current tilemap reference by scenes:[${tilemaps.map(v => v.name).join()}]`);
    }

    await ctx.db.delete(id);
    await ctx.storage.delete(entity.storageId)
  },
});