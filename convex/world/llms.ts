import { ObjectType, v, ConvexError } from 'convex/values';
import { idWorld } from '../worlds';
import { defineTable } from "convex/server";
import { mutation, query, internalQuery, internalMutation  } from '../_generated/server';
import { QueryMutationCtx } from '../shared/type';
import { Doc, Id } from "../_generated/dataModel";
import { idSpritesheet, read as readSpritesheet, SpritesheetDoc } from "./spritesheets";
import { TextureDoc, read as readTexture } from "./textures"
import { asyncMap } from "convex-helpers";
import { api } from "../_generated/api";


export const table = 'llms';
export const indexName_ByWorldId = 'byWorldId';
export const idLLM = v.id(table);

export const llmSerialized = {
  modifyTime: v.number(),
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

export type LLMTable = typeof table
export type LLMId = Id<LLMTable>
export type LLMDoc = Doc<LLMTable>

export type SerializedLLM = ObjectType<typeof llmSerialized>;
export type InsertArgs = ObjectType<typeof insertArgs>;
export type UpdateArgs = ObjectType<typeof updateArgs>;
export type DeleteArgs = ObjectType<typeof deleteArgs>;

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

export const update = mutation({
  args: updateArgs,
  handler: async (ctx, args) => {
    const { id, ...patchData } = args
    const modifyTime = +new Date()
    await ctx.db.patch(id, { ...patchData, modifyTime });
  },
});

export const delete_ = mutation({
  args: deleteArgs,
  handler: async (ctx, args) => {
    const { id } = args
    // const sceneNPCs = await ctx.runQuery(api.world.sceneNPCs.listByCharacter, { characterId: id })
    // if (sceneNPCs.length > 0) {
    //   throw new ConvexError(`current character reference by sceneNPCs:[${sceneNPCs.map(v => v.name).join()}]`);
    // }
    await ctx.db.delete(id);
  },
});
