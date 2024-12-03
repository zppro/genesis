import { ObjectType, v } from 'convex/values';
import { IdWorld } from '../worlds';
import { defineTable } from "convex/server";
import { internalMutation, mutation, query } from '../_generated/server';


export const table = 'scenes';
export const indexName_ByWorldId = 'byWorldId';
export const IdScene = v.id(table);
export const sceneSerialized = {
  name: v.string(),
  desc: v.optional(v.string()),
  worldId: IdWorld,
};
const { ...insertArgs } = sceneSerialized
const { worldId: _, ..._updateArgs } = insertArgs
const updateArgs = { id: IdScene, ..._updateArgs }
const deleteArgs = { id: IdScene }

type SceneTable = typeof table
export type SerializedScene = ObjectType<typeof sceneSerialized>;
export type InsertArgs = ObjectType<typeof insertArgs>;
export type UpdateArgs = ObjectType<typeof updateArgs>;
export type DeleteArgs = ObjectType<typeof deleteArgs>;

export const tableSchema = defineTable(sceneSerialized).index(indexName_ByWorldId, ["worldId"])

export const create = mutation({
  args: insertArgs,
  handler: async (ctx, args) => {
    return await ctx.db.insert(table, args);
  },
});

export const list = query({
  args: { worldId: IdWorld },
  handler: async (ctx, args) => {
    const { worldId } = args
    return await ctx.db.query(table).withIndex(indexName_ByWorldId, (q) =>
      q
        .eq("worldId", worldId)
    ).collect();
  },
})

export const update = internalMutation({
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

export const delete_ = internalMutation({
  args: deleteArgs,
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});