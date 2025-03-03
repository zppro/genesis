import { ObjectType, v, ConvexError, Infer } from 'convex/values';
import { ActionCtx, MutationCtx, QueryCtx } from '../_generated/server';

export type QueryMutationCtx = QueryCtx | MutationCtx

export type ConvexCtx = ActionCtx | QueryMutationCtx

export const llmMessages = v.array(v.object({
  role: v.string(),
  content: v.string(),
}))

export type LLMMessages = Infer<typeof llmMessages>

export const toolTypeFunction = 'function' as const;
export const toolTypes = v.union(v.literal(toolTypeFunction));
export const llmTools = v.array(v.object({
  type: v.literal("function"),
  def: v.record(v.string(), v.any())
}))

export const functionDef = v.object({
  name: v.string(),
  description: v.string(),
  schema: v.record(v.string(), v.any())
}) 