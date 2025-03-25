import { ConvexError } from 'convex/values';
import { QueryMutationCtx } from '../../shared/context';
import { MutationCtx } from '../../_generated/server';
import { asyncMap } from "convex-helpers";
import {
  table, SceneNPCDoc, SceneNPCId,
  indexName_BySceneId, indexName_ByCharacterId,
} from "./schema";
import { SceneNPCExtendDoc, SceneNPCSyncDoc } from "./extend";
import { _readExOrThrow as readCharacterExOrThrow, _readSyncOrThrow as readCharacterSyncOrThrow } from '../character/helper';
import { _readOrThrow as readLLMOrThrow } from '../llms';
import {
  ReadArgs, ListByIdsArgs, ListBySceneArgs, ListByCharacterArgs,
  InsertArgs, UpdateArgs, PatchArgs, DeleteArgs
} from "./args";
import { api, internal } from "../../_generated/api";
import { checkNeedNotifyUpstream } from "../../shared/sync";
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

export async function _readExByIdOrEntity(ctx: QueryMutationCtx, entityOrId: SceneNPCDoc | SceneNPCId): Promise<SceneNPCExtendDoc> {
  let entity: SceneNPCDoc;
  if (typeof entityOrId === "string") {
    entity = await _readOrThrow(ctx, { id: entityOrId })
  } else {
    entity = entityOrId
  }
  const characterEx = await readCharacterExOrThrow(ctx, { id: entity.characterId });

  return { ...entity, characterEx };
}

export async function _readSyncByIdOrEntity(ctx: QueryMutationCtx, entityOrId: SceneNPCDoc | SceneNPCId): Promise<SceneNPCSyncDoc> {
  let entity: SceneNPCDoc;
  if (typeof entityOrId === "string") {
    entity = await _readOrThrow(ctx, { id: entityOrId })
  } else {
    entity = entityOrId
  }
  const characterSync = await readCharacterSyncOrThrow(ctx, { id: entity.characterId });
  return { ...entity, characterSync };
}

export async function _listByIds(ctx: QueryMutationCtx, args: ListByIdsArgs) {
  const { ids } = args
  // may be db.get(id) faster than  filter ids
  const entities = await Promise.all(ids.map(async (id) => {
    return await ctx.db.get(id)
  }))
  return entities.filter(v => !!v)
}

export async function _listByScene(ctx: QueryMutationCtx, args: ListBySceneArgs) {
  const { sceneId } = args
  return await ctx.db.query(table).withIndex(indexName_BySceneId, (q) =>
    q
      .eq("sceneId", sceneId)
  ).collect();
}

export async function _listExByScene(ctx: QueryMutationCtx, args: ListBySceneArgs) {
  const entityExs: SceneNPCExtendDoc[] = await asyncMap(
    await _listByScene(ctx, args),
    async (entity) => {
      return await _readExByIdOrEntity(ctx, entity);
    }
  );
  return entityExs
}

export async function _listSyncByScene(ctx: QueryMutationCtx, args: ListBySceneArgs) {
  const entitySyncs: SceneNPCSyncDoc[] = await asyncMap(
    await _listByScene(ctx, args),
    async (entity) => {
      return await _readSyncByIdOrEntity(ctx, entity);
    }
  );
  return entitySyncs
}

export async function _listByCharacter(ctx: QueryMutationCtx, args: ListByCharacterArgs) {
  const { characterId } = args
  return await ctx.db.query(table).withIndex(indexName_ByCharacterId, (q) =>
    q
      .eq("characterId", characterId)
  ).collect();
}


/*** mutation helper ***/

export async function _create(ctx: MutationCtx, args: InsertArgs) {
  const modifyTime = +new Date()
  const createRes = await ctx.db.insert(table, { ...args, modifyTime });
  await ctx.runMutation(internal.world.scenes.updateModifyTime, { id: args.sceneId })
  return createRes
}

export async function _update(ctx: MutationCtx, args: UpdateArgs) {
  const { id, ...patchData } = args
  const entity = await ctx.db.get(id);
  if (!entity) {
    throw new Error(`Invalid \`${table}\` ID: ${args.id}`);
  }
  const modifyTime = +new Date()
  await ctx.db.patch(id, { ...patchData, modifyTime });

  let needNotifyUpstream = checkNeedNotifyUpstream(entity, patchData,
    "name", "characterId", "x", "y", "w", "h", "speed", "move")

  if (needNotifyUpstream) {
    await ctx.runMutation(internal.world.scenes.updateModifyTime, { id: entity.sceneId })
  }
}

export async function _patch(ctx: MutationCtx, args: PatchArgs) {
  const { id, ...patchData } = args
  const entity = await ctx.db.get(id);
  if (!entity) {
    throw new Error(`Invalid \`${table}\` ID: ${args.id}`);
  }
  const modifyTime = +new Date()
  await ctx.db.patch(id, { ...patchData, modifyTime });

  let needNotifyUpstream = checkNeedNotifyUpstream(entity, patchData,
    "name", "characterId", "x", "y", "w", "h", "speed", "move")

  if (needNotifyUpstream) {
    await ctx.runMutation(internal.world.scenes.updateModifyTime, { id: entity.sceneId })
  }
}

export async function _delete(ctx: MutationCtx, args: DeleteArgs) {
  const { id } = args
  const entity = await ctx.db.get(id);
  if (!entity) {
    throw new Error(`Invalid \`${table}\` ID: ${id}`);
  }
  await ctx.db.delete(id);
  await ctx.runMutation(internal.world.scenes.updateModifyTime, { id: entity.sceneId })
}