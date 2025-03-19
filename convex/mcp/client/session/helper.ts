import { ConvexError } from 'convex/values';
import { QueryMutationCtx } from '../../../shared/context';
import { MutationCtx } from '../../../_generated/server';
import {
  table,
  indexName_ByName,
  indexName_ByServerSessionId
} from "./schema";
import {
  ReadArgs, ReadByNameArgs, ReadByServerSessionArgs,
  InsertArgs, UpdateArgs, PatchArgs, DeleteArgs, DeleteByIdsArgs,
} from "./args";
import { Options } from '../../../shared/opts';


/*** query helper ***/

export async function _readOrThrow(ctx: QueryMutationCtx, args: ReadArgs, opts?: Options) {
  const entity = await _read(ctx, args);
  if (!entity) throw new ConvexError(opts?.throwErrorMsg ? opts?.throwErrorMsg : `Invalid \`${table}\` engineId: ${args.id}`);
  return entity;
}

export async function _read(ctx: QueryMutationCtx, args: ReadArgs) {
  const { id } = args;
  return await ctx.db.get(id);
}

export async function _readByName(ctx: QueryMutationCtx, args: ReadByNameArgs) {
  const { name } = args;
  return await ctx.db.query(table)
    .withIndex(indexName_ByName, (q) => q.eq("name", name))
    .first();
}

export async function _readByServerSession(ctx: QueryMutationCtx, args: ReadByServerSessionArgs) {
  const { serverSessionId } = args;
  return await ctx.db.query(table)
    .withIndex(indexName_ByServerSessionId, (q) => q.eq("serverSessionId", serverSessionId))
    .unique();
}

export async function _list(ctx: QueryMutationCtx) {
  return await ctx.db.query(table)
    .collect();
}

/*** mutation helper ***/

export async function _create(ctx: MutationCtx, args: InsertArgs) {
  const lastActiveTime = +new Date()
  return await ctx.db.insert(table, { ...args, lastActiveTime });
}

export async function _update(ctx: MutationCtx, args: UpdateArgs) {
  const { id, ...patchData } = args
  const entity = await ctx.db.get(id);
  if (!entity) {
    throw new Error(`Invalid \`${table}\` ID: ${args.id}`);
  }
  const lastActiveTime = +new Date()
  await ctx.db.patch(id, { ...patchData, lastActiveTime });
}

export async function _patch(ctx: MutationCtx, args: PatchArgs) {
  const { id, ...patchData } = args
  const entity = await ctx.db.get(id);
  if (!entity) {
    throw new Error(`Invalid \`${table}\` ID: ${args.id}`);
  }
  const lastActiveTime = +new Date()
  await ctx.db.patch(id, { ...patchData, lastActiveTime });
}

export async function _delete(ctx: MutationCtx, args: DeleteArgs) {
  const { id } = args
  await ctx.db.delete(id);
}

export async function _deleteByIds(ctx: MutationCtx, args: DeleteByIdsArgs) {
  const { ids } = args
  await Promise.all(ids.map(async (id) => {
    return await ctx.db.delete(id)
  }))
}
