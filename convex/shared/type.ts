import { ObjectType, v, ConvexError, Infer } from 'convex/values';
import { ActionCtx, MutationCtx, QueryCtx } from '../_generated/server';

export type QueryMutationCtx = QueryCtx | MutationCtx

export type ConvexCtx = ActionCtx | QueryMutationCtx

export const llmMessages = v.array(v.object({
  role: v.string(),
  content: v.string(),
}))

export type LLMMessages = Infer<typeof llmMessages>