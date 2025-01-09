import { ObjectType, v } from 'convex/values';
import { idWorld } from '../worlds';
import { defineTable } from "convex/server";
import { internalMutation, mutation, query } from '../_generated/server';
import { Doc, Id } from "../_generated/dataModel";
import { idResource, ResourceDoc } from "./resources";
import { api } from "../_generated/api";
import { asyncMap } from "convex-helpers";

export const table = 'scenes';
export const indexName_ByWorldId = 'by_worldId';
export const indexName_ByTilesetId = 'by_tilesetId';
export const indexName_ByTilemapId = 'by_tilemapId';
export const idScene = v.id(table);

export const sceneSerialized = {
  modifyTime: v.number(),
  name: v.string(),
  desc: v.optional(v.string()),
  worldId: idWorld,
  syncTime: v.optional(v.number()),
  // a tile's dimension
  tiledim: v.number(),
  // x axis tiles number in map
  screenxtiles: v.number(),
  // y axis tiles number in map
  screenytiles: v.number(),
  // tileset png width
  tilesetpxw: v.number(),
  // tileset png height
  tilesetpxh: v.number(),
  // reource type = 'tileset'
  tilesetId: idResource,
  // reource type = 'tilemap'
  tilemapId: idResource,
  // 作为前景，会对character产生block
  blockLayers: v.optional(v.array(v.string())),
};
const { modifyTime, ...insertArgs } = sceneSerialized
const { worldId: _, ..._updateArgs } = insertArgs
const updateArgs = { id: idScene, ..._updateArgs }
const deleteArgs = { id: idScene }
const setBlockLayersArgs = { id: idScene, blockLayers: v.array(v.string()) }
const updateTimeArgs = { id: idScene }

export type SceneTable = typeof table
export type SceneId = Id<SceneTable>
export type SceneDoc = Doc<SceneTable>
export type SceneExtendDoc = SceneDoc & {
  tileset: ResourceDoc,
  tilemap: ResourceDoc,
};
export type SerializedScene = ObjectType<typeof sceneSerialized>;
export type InsertArgs = ObjectType<typeof insertArgs>;
export type UpdateArgs = ObjectType<typeof updateArgs>;
export type DeleteArgs = ObjectType<typeof deleteArgs>;
export type SetBlockerLayersArgs = ObjectType<typeof setBlockLayersArgs>;
export type UpdateTimeArgs = ObjectType<typeof updateTimeArgs>;

export const tableSchema = defineTable(sceneSerialized)
  .index(indexName_ByWorldId, ["worldId"])
  .index(indexName_ByTilesetId, ["tilesetId"])
  .index(indexName_ByTilemapId, ["tilemapId"])

export const create = mutation({
  args: insertArgs,
  handler: async (ctx, args) => {
    const modifyTime = +new Date()
    return await ctx.db.insert(table, { ...args, modifyTime });
  },
});

export const read = query({
  args: { id: idScene },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const readEx = query({
  args: { id: idScene },
  handler: async (ctx, args) => {
    const entity = await read(ctx, args)
    const tileset = await ctx.runQuery(api.world.resources.read, { id: entity?.tilesetId! })
    const tilemap = await ctx.runQuery(api.world.resources.read, { id: entity?.tilemapId! })
    // const tilemap = await readResource(ctx, { id: entity?.tilemapId! })
    const extendEntity: SceneExtendDoc = { ...entity!, tileset: tileset!, tilemap: tilemap! }
    return extendEntity
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

export const listEx = query({
  args: { worldId: idWorld },
  handler: async (ctx, args) => {
    const entityExs: SceneExtendDoc[] = await asyncMap(
      await list(ctx, args),
      async (entity) => {
        const tileset = await ctx.runQuery(api.world.resources.read, { id: entity.tilesetId })
        const tilemap = await ctx.runQuery(api.world.resources.read, { id: entity.tilemapId })
        return { ...entity, tileset: tileset!, tilemap: tilemap! }
      }
    );
    return entityExs
  },
})

export const listByTilesetId = query({
  args: { tilesetId: idResource },
  handler: async (ctx, args) => {
    const { tilesetId } = args
    return await ctx.db.query(table).withIndex(indexName_ByTilesetId, (q) =>
      q
        .eq("tilesetId", tilesetId)
    ).collect();
  },
})

export const listByTilemapId = query({
  args: { tilemapId: idResource },
  handler: async (ctx, args) => {
    const { tilemapId } = args
    return await ctx.db.query(table).withIndex(indexName_ByTilemapId, (q) =>
      q
        .eq("tilemapId", tilemapId)
    ).collect();
  },
})

export const update = mutation({
  args: updateArgs,
  handler: async (ctx, args) => {
    const { id, ...patchData } = args
    // because updateArgs validator,no more validate
    // const entity = await ctx.db.get(id);
    // if (!entity) {
    //   throw new Error(`Invalid \`${table}\` ID: ${args.id}`);
    // }
    const modifyTime = +new Date()
    return await ctx.db.patch(id, { ...patchData, modifyTime });
  },
});

export const delete_ = mutation({
  args: deleteArgs,
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

export const setBlockerLayers = mutation({
  args: setBlockLayersArgs,
  handler: async (ctx, args) => {
    const { id, ...patchData } = args
    const modifyTime = +new Date()
    return await ctx.db.patch(args.id, { ...patchData, modifyTime });
  },
});

export const updateModifyTime = internalMutation({
  args: updateTimeArgs,
  handler: async (ctx, args) => {
    const { id } = args
    const modifyTime = +new Date()
    return await ctx.db.patch(id, { modifyTime });
  },
});

export const updateSyncTime = mutation({
  args: updateTimeArgs,
  handler: async (ctx, args) => {
    const { id } = args
    const syncTime = +new Date()
    return await ctx.db.patch(id, { syncTime });
  },
});