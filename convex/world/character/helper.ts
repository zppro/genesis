import { ConvexError } from 'convex/values';
import { QueryMutationCtx } from '../../shared/context';
import { MutationCtx } from '../../_generated/server';
import { asyncMap } from "convex-helpers";
import { api, internal } from "../../_generated/api";
import {
  table, CharacterDoc, CharacterId,
  indexName_ByWorldId, indexName_ByWorldIdAndSpritesheetId,
} from "./schema";
import { CharacterExtendDoc, CharacterSyncDoc } from "./extend";
import { _readExByIdOrEntity as readSpritesheetExOrThrow } from '../spritesheets';
import { _listExByIds as listSkillExsByIds, _listSyncByIds as listSkillSyncsByIds } from '../skill/helper';
import {
  ReadArgs, ListArgs, ListBySpritesheetArgs, ListBySkillArgs,
  InsertArgs, UpdateArgs, PatchArgs, DeleteArgs,
} from "./args";
import { Options } from '../../shared/opts';
import { checkNeedNotifyUpstream } from "../../shared/sync";


/*** query helper ***/

export async function _readOrThrow(ctx: QueryMutationCtx, args: ReadArgs, opts?: Options) {
  const entity = await _read(ctx, args);
  if (!entity) throw new ConvexError(opts?.throwErrorMsg ? opts?.throwErrorMsg : `Invalid \`${table}\` _id: ${args.id}`);
  return entity;
}

export async function _read(ctx: QueryMutationCtx, args: ReadArgs) {
  const { id } = args;
  return await ctx.db.get(id);
}

export async function _readExOrThrow(ctx: QueryMutationCtx, args: ReadArgs, opts?: Options) {
  const entityEx = await _readExByIdOrEntity(ctx, args.id);
  if (!entityEx) throw new ConvexError(opts?.throwErrorMsg ? opts?.throwErrorMsg : `Invalid \`${table}\` _id: ${args.id}`);
  return entityEx;
}

export async function _readExByIdOrEntity(ctx: QueryMutationCtx, entityOrId: CharacterDoc | CharacterId): Promise<CharacterExtendDoc> {
  let entity: CharacterDoc;
  if (typeof entityOrId === "string") {
    entity = await _readOrThrow(ctx, { id: entityOrId })
  } else {
    entity = entityOrId
  }
  const { texture, ...spritesheet } = await readSpritesheetExOrThrow(ctx, entity.spritesheetId);
  const skillExs = await listSkillExsByIds(ctx, { ids: entity.skillIds })
  return { ...entity, spritesheet, textureUrl: texture.url, skillExs };
}

export async function _readSyncOrThrow(ctx: QueryMutationCtx, args: ReadArgs, opts?: Options) {
  const entitySync = await _readSyncByIdOrEntity(ctx, args.id);
  if (!entitySync) throw new ConvexError(opts?.throwErrorMsg ? opts?.throwErrorMsg : `Invalid \`${table}\` engineId: ${args.id}`);
  return entitySync;
}

export async function _readSyncByIdOrEntity(ctx: QueryMutationCtx, entityOrId: CharacterDoc | CharacterId): Promise<CharacterSyncDoc> {
  let entity: CharacterDoc;
  if (typeof entityOrId === "string") {
    entity = await _readOrThrow(ctx, { id: entityOrId })
  } else {
    entity = entityOrId
  }
  const { texture, ...spritesheet } = await readSpritesheetExOrThrow(ctx, entity.spritesheetId);
  const skillSyncs = await listSkillSyncsByIds(ctx, { ids: entity.skillIds })
  return { ...entity, spritesheet, textureUrl: texture.url, skillSyncs };
}

export async function _list(ctx: QueryMutationCtx, args: ListArgs) {
  const { worldId } = args;
  return await ctx.db.query(table)
    .withIndex(indexName_ByWorldId, (q) => q.eq("worldId", worldId))
    .collect();
}

export async function _listBySpritesheet(ctx: QueryMutationCtx, args: ListBySpritesheetArgs) {
  const { worldId, spritesheetId } = args;
  return await ctx.db.query(table).withIndex(indexName_ByWorldIdAndSpritesheetId, (q) =>
    q
      .eq("worldId", worldId)
      .eq("spritesheetId", spritesheetId)
  ).collect();
}

export async function _listBySkill(ctx: QueryMutationCtx, args: ListBySkillArgs) {
  const { worldId, skillId } = args;
  const entities = await _list(ctx, { worldId });
  return entities.filter(e => e.skillIds.includes(skillId))
}

export async function _listEx(ctx: QueryMutationCtx, args: ListArgs) {
  const entityExs: CharacterExtendDoc[] = await asyncMap(
    await _list(ctx, args),
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
  const sceneNPCs = await ctx.runQuery(api.world.sceneNPC.query.listByCharacter, { characterId: id })
  if (sceneNPCs.length > 0) {
    throw new ConvexError(`current character reference by sceneNPCs:[${sceneNPCs.map(v => v.name).join()}]`);
  }
  await ctx.db.delete(id);
}