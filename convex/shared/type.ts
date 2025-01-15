import { ActionCtx, MutationCtx, QueryCtx  } from '../_generated/server';

export type QueryMutationCtx = QueryCtx | MutationCtx

export type ConvexCtx = ActionCtx | QueryMutationCtx