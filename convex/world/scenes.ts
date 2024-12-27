import { ObjectType, v } from 'convex/values';
import { idWorld } from '../worlds';
import { defineTable } from "convex/server";
import { mutation, query } from '../_generated/server';
import { Doc, Id } from "../_generated/dataModel";
import { idResource, read as readResource, ResourceDoc } from "./resources";
import { api } from "../_generated/api";
import { asyncMap } from "convex-helpers";

export const table = 'scenes';
export const indexName_ByWorldId = 'by_worldId';
export const idScene = v.id(table);
export const sceneSerialized = {
  name: v.string(),
  desc: v.optional(v.string()),
  worldId: idWorld,

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
};
const { ...insertArgs } = sceneSerialized
const { worldId: _, ..._updateArgs } = insertArgs
const updateArgs = { id: idScene, ..._updateArgs }
const deleteArgs = { id: idScene }

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

export const tableSchema = defineTable(sceneSerialized)
  .index(indexName_ByWorldId, ["worldId"])

export const create = mutation({
  args: insertArgs,
  handler: async (ctx, args) => {
    return await ctx.db.insert(table, args);
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
    const tileset = await readResource(ctx, { id: entity?.tilesetId! })
    const tilemap = await readResource(ctx, { id: entity?.tilemapId! })
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

export const update = mutation({
  args: updateArgs,
  handler: async (ctx, args) => {
    const { id, ...patchData } = args
    const entity = await ctx.db.get(id);
    if (!entity) {
      throw new Error(`Invalid \`${table}\` ID: ${args.id}`);
    }
    return await ctx.db.patch(id, patchData);
  },
});

export const delete_ = mutation({
  args: deleteArgs,
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});