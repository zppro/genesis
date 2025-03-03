import { ConvexError } from 'convex/values';
import { QueryMutationCtx } from '../../shared/context';
import { MutationCtx } from '../../_generated/server';
import { table, SkillDoc, SkillId, indexName_ByWorldId } from "./schema";
import { SkillExtendDoc } from "./extend";
import { _readOrThrow as readTextureOrThrow } from '../textures';
import { InsertArgs, UpdateArgs, PatchArgs, DeleteArgs, ReadArgs, ListArgs, } from "./args";
import { Options } from '../../shared/opts';


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

export async function _readExByIdOrEntity(ctx: QueryMutationCtx, entityOrId: SkillDoc | SkillId): Promise<SkillExtendDoc> {
  let entity: SkillDoc;
  if (typeof entityOrId === "string") {
    entity = await _readOrThrow(ctx, { id: entityOrId })
  } else {
    entity = entityOrId
  }
  const { url } = await readTextureOrThrow(ctx, { id: entity.textureId });
  return { ...entity, textureUrl: url };
}

export async function _list(ctx: QueryMutationCtx, args: ListArgs) {
  const { worldId } = args;
  return await ctx.db.query(table)
    .withIndex(indexName_ByWorldId, (q) => q.eq("worldId", worldId))
    .collect();
}


/*** mutation helper ***/

export async function _create(ctx: MutationCtx, args: InsertArgs) {
  const modifyTime = +new Date()
  return await ctx.db.insert(table, { ...args, modifyTime });
}

export async function _update(ctx: MutationCtx, args: UpdateArgs) {
  const { id, ...patchData } = args
  const modifyTime = +new Date()
  await ctx.db.patch(id, { ...patchData, modifyTime });
}

export async function _patch(ctx: MutationCtx, args: PatchArgs) {
  const { id, ...patchData } = args
  const modifyTime = +new Date()
  await ctx.db.patch(id, { ...patchData, modifyTime });
}

export async function _delete(ctx: MutationCtx, args: DeleteArgs) {
  const { id } = args
  await ctx.db.delete(id);
}