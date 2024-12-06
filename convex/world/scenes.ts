import { ObjectType, v } from 'convex/values';
import { idWorld } from '../worlds';
import { defineTable } from "convex/server";
import { internalMutation, mutation, query } from '../_generated/server';
import { Doc, Id } from "../_generated/dataModel";

export const table = 'scenes';
export const indexName_ByWorldId = 'byWorldId';
export const idScene = v.id(table);
export const sceneSerialized = {
  name: v.string(),
  desc: v.optional(v.string()),
  worldId: idWorld,
};
const { ...insertArgs } = sceneSerialized
const { worldId: _, ..._updateArgs } = insertArgs
const updateArgs = { id: idScene, ..._updateArgs }
const deleteArgs = { id: idScene }

export type SceneTable = typeof table
export type SceneId = Id<SceneTable>
export type SceneDoc = Doc<SceneTable>
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

export const read = query({
  args: { id: idScene },
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
    console.log('entity=>', entity)
    console.log('patchData=>', patchData)
    return await ctx.db.patch(id, patchData);
  },
});

export const delete_ = mutation({
  args: deleteArgs,
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});