import { ObjectType, v, ConvexError } from 'convex/values';
import { idLLM } from '../world/llms';
import { defineTable, paginationOptsValidator } from "convex/server";
import { mutation, query, internalMutation, MutationCtx, QueryCtx } from '../_generated/server';
import { Doc, Id } from "../_generated/dataModel";


export const table = 'llmLogs';
export const indexName_ByLLMId = 'byLLMId';
export const idLLMLog = v.id(table);


export const reqRaw = {
  model: v.string(),
  messages: v.array(v.object({
    role: v.string(),
    content: v.string(),
  }))
}
export type ReqRaw = ObjectType<typeof reqRaw>;

export const llmLogSerialized = {
  modifyTime: v.number(),
  llmId: idLLM,
  reqTime: v.number(),
  reqRaw: v.object(reqRaw),
  resTime: v.optional(v.number()),
  resContent: v.optional(v.string()),
  resRaw: v.optional(v.any()),
};



const { modifyTime, ...insertArgs } = llmLogSerialized
const { reqTime: _1, reqRaw: _2, llmId: _3, ..._updateArgs } = insertArgs
const updateArgs = { id: idLLMLog, ..._updateArgs }
const deleteArgs = { id: idLLMLog }

export type LLMLogTable = typeof table
export type LLMLogId = Id<LLMLogTable>
export type LLMLogDoc = Doc<LLMLogTable>

export type SerializedLLMLog = ObjectType<typeof llmLogSerialized>;
export type InsertArgs = ObjectType<typeof insertArgs>;
export type UpdateArgs = ObjectType<typeof updateArgs>;
export type DeleteArgs = ObjectType<typeof deleteArgs>;

export const tableSchema = defineTable(llmLogSerialized)
  .index(indexName_ByLLMId, ["llmId"])

export const create = internalMutation({
  args: insertArgs,
  handler: async (ctx, args) => {
    return await _create(ctx, args);
  },
});

export const _create = async (ctx: MutationCtx, args: InsertArgs) => {
  const modifyTime = +new Date()
  return await ctx.db.insert(table, { ...args, modifyTime });
}

export const read = query({
  args: { id: idLLMLog },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const list = query({
  args: { llmId: idLLM },
  handler: async (ctx, args) => {
    const { llmId } = args
    return await ctx.db.query(table).withIndex(indexName_ByLLMId, (q) =>
      q
        .eq("llmId", llmId)
    ).collect();
  },
})

export const page = query({
  args: { llmId: idLLM, opts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const { llmId, opts } = args
    return await ctx.db.query(table).withIndex(indexName_ByLLMId, (q) =>
      q
        .eq("llmId", llmId)
    ).paginate(opts)
  },
})

export const update = internalMutation({
  args: updateArgs,
  handler: async (ctx, args) => {
    await _update(ctx, args)
  },
});

export const _update = async (ctx: MutationCtx, args: UpdateArgs) => {
  const { id, ...patchData } = args
  const modifyTime = +new Date()
  await ctx.db.patch(id, { ...patchData, modifyTime });
}

export const delete_ = internalMutation({
  args: deleteArgs,
  handler: async (ctx, args) => {
    const { id } = args
    await ctx.db.delete(id);
  },
});