import { ObjectType, v, ConvexError } from 'convex/values';
import { idWorld } from '../worlds';
import { defineTable } from "convex/server";
import { mutation, query, internalMutation, MutationCtx } from '../_generated/server';
import { QueryMutationCtx } from '../shared/type';
import { Doc, Id } from "../_generated/dataModel";
import { api, internal } from "../_generated/api";
import { checkNeedNotifyUpstream } from "../shared/sync";


export const table = 'llms';
export const indexName_ByWorldId = 'byWorldId';
export const idLLM = v.id(table);

export const llmSerialized = {
  modifyTime: v.number(),
  syncTime: v.optional(v.number()),
  name: v.string(), // model name
  desc: v.optional(v.string()),
  worldId: idWorld,
  provider: v.string(),
  model: v.string(),
  // store apikeyname in the enviorment variables
  apiKeyName: v.string(),
  baseUrl: v.string(),
};


const { modifyTime, ...insertArgs } = llmSerialized
const { worldId: _, ..._updateArgs } = insertArgs
const updateArgs = { id: idLLM, ..._updateArgs }
const deleteArgs = { id: idLLM }
const updateTimeArgs = { id: idLLM }

export type LLMTable = typeof table
export type LLMId = Id<LLMTable>
export type LLMDoc = Doc<LLMTable>

export type SerializedLLM = ObjectType<typeof llmSerialized>;
export type InsertArgs = ObjectType<typeof insertArgs>;
export type UpdateArgs = ObjectType<typeof updateArgs>;
export type PatchArgs = { id: LLMId } & Partial<ObjectType<typeof _updateArgs>>;
export type DeleteArgs = ObjectType<typeof deleteArgs>;
export type UpdateTimeArgs = ObjectType<typeof updateTimeArgs>;


export const tableSchema = defineTable(llmSerialized)
  .index(indexName_ByWorldId, ["worldId"])

export const create = mutation({
  args: insertArgs,
  handler: async (ctx, args) => {
    const modifyTime = +new Date()
    return await ctx.db.insert(table, { ...args, modifyTime });
  },
});

export const read = query({
  args: { id: idLLM },
  handler: async (ctx, args) => {
    return await _read(ctx, args.id)
  },
});

export async function _readOrThrow(ctx: QueryMutationCtx, id: LLMId) {
  const entity = await _read(ctx, id);
  if (!entity) throw new ConvexError(`Invalid \`${table}\` ID: ${id}`);
  return entity;
}

export async function _read(ctx: QueryMutationCtx, id: LLMId) {
  return await ctx.db.get(id);
}

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

// function checkNeedNotifyUpstream(entity: LLMDoc, newEntityFields: Partial<LLMDoc>, ...checkFields: (keyof LLMDoc)[]) {
//   return Object.keys(newEntityFields).some(v => {
//     const k = v as (keyof LLMDoc)
//     return checkFields.includes(k) && newEntityFields[k] && newEntityFields[k] !== entity[k]
//   })
// }

export const update = mutation({
  args: updateArgs,
  handler: async (ctx, args) => {
    const { id, ...patchData } = args
    const entity = await ctx.db.get(id);
    if (!entity) {
      throw new Error(`Invalid \`${table}\` ID: ${args.id}`);
    }

    const modifyTime = +new Date()
    let needNotifyUpstream = checkNeedNotifyUpstream(entity, patchData,
      "name", "desc", "provider", "model", "apiKeyName", "baseUrl")

    await ctx.db.patch(id, { ...patchData, modifyTime });

    if (needNotifyUpstream) {
      const skills = await ctx.runQuery(api.world.skill.query.listByLLM, { worldId: entity.worldId, llmId: entity._id })
      await Promise.all(skills.map(async (skill) => {
        await ctx.runMutation(internal.world.skill.mutation.updateModifyTime, { id: skill._id })
      }))
    }

  },
});


export async function _patch(ctx: MutationCtx, args: PatchArgs) {
  const { id, ...patchData } = args
  return await ctx.db.patch(id, patchData);
}

export const delete_ = mutation({
  args: deleteArgs,
  handler: async (ctx, args) => {
    const { id } = args
    const entity = await ctx.db.get(id);
    if (!entity) {
      throw new Error(`Invalid \`${table}\` ID: ${args.id}`);
    }
    const skills = await ctx.runQuery(api.world.skill.query.listByLLM, { worldId: entity.worldId, llmId: entity._id })
    if (skills.length > 0) {
      throw new ConvexError(`current llm reference by skills:[${skills.map(v => v.name).join()}]`);
    }
    await ctx.db.delete(id);
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