import { ConvexError } from 'convex/values';
import { QueryMutationCtx } from '../../shared/context';
import { MutationCtx } from '../../_generated/server';
import { asyncMap } from "convex-helpers";
import { table, SkillDoc, SkillId, indexName_ByWorldId } from "./schema";
import { SkillExtendDoc } from "./extend";
import { _readOrThrow as readTextureOrThrow } from '../textures';
import { _readOrThrow as readLLMOrThrow } from '../llms';
import {
  ReadArgs, ListArgs, ListByIdsArgs,
  InsertArgs, UpdateArgs, PatchArgs, DeleteArgs,
} from "./args";
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
  const llm = await readLLMOrThrow(ctx, entity.llmId)
  return { ...entity, textureUrl: url, llm };
}

export async function _list(ctx: QueryMutationCtx, args: ListArgs) {
  const { worldId } = args;
  return await ctx.db.query(table)
    .withIndex(indexName_ByWorldId, (q) => q.eq("worldId", worldId))
    .collect();
}

export async function _listEx(ctx: QueryMutationCtx, args: ListArgs) {
  const entityExs: SkillExtendDoc[] = await asyncMap(
    await _list(ctx, args),
    async (entity) => {
      return await _readExByIdOrEntity(ctx, entity);
    }
  );
  return entityExs
}

export async function _listByIds(ctx: QueryMutationCtx, args: ListByIdsArgs) {
  const { ids } = args
  // may be db.get(id) faster than  filter ids
  const entities = await Promise.all(ids.map(async (id) => {
    return await ctx.db.get(id)
  }))
  return entities.filter(v => !!v)
}

export async function _listExByIds(ctx: QueryMutationCtx, args: ListByIdsArgs) {
  const entityExs: SkillExtendDoc[] = await asyncMap(
    await _listByIds(ctx, args),
    async (entity) => {
      return await _readExByIdOrEntity(ctx, entity);
    }
  );
  return entityExs
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