import { ConvexError } from 'convex/values';
import { QueryMutationCtx } from '../../shared/context';
import { MutationCtx } from '../../_generated/server';
import { asyncMap } from "convex-helpers";
import {
  table, SkillDoc, SkillId,
  indexName_ByWorldId, indexName_ByWorldIdAndTextureId,
  indexName_ByWorldIdAndLLMId, indexName_ByWorldIdAndType,
  skillTypeMcpTool
} from "./schema";
import { SkillExtendDoc, SkillSyncDoc } from "./extend";
import { _readOrThrow as readTextureOrThrow } from '../textures';
import { _readOrThrow as readLLMOrThrow } from '../llms';
import {
  ReadArgs, ListArgs, ListByIdsArgs, ListByTextureArgs,
  ListByLLMArgs, ListByMcpServerToolArgs, ListByMcpServerToolsArgs,
  InsertArgs, UpdateArgs, PatchArgs, DeleteArgs, BatchUpdateTimeArgs,
} from "./args";
import { api, internal } from "../../_generated/api";
import { checkNeedNotifyUpstream } from "../../shared/sync";
import { Options } from '../../shared/opts';
import { _listExByIds as listMcpServersByIds } from '../mcpServer/helper';
import type { McpServerExtendDoc } from "../mcpServer/extend";
import { _listByIds as listMcpServerToolsByIds } from "../mcpServerTool/helper"
import type { McpServerToolDoc } from '../mcpServerTool/schema';


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

  let mcpServerTools: McpServerToolDoc[] | undefined = undefined
  if (entity.data.type === skillTypeMcpTool) {
    const mcpServerToolIds = entity.data.tools.map(t => t.id)
    mcpServerTools = await listMcpServerToolsByIds(ctx, { ids: mcpServerToolIds })
  }
  return { ...entity, textureUrl: url, llm, mcpServerTools };
}

export async function _readSyncByIdOrEntity(ctx: QueryMutationCtx, entityOrId: SkillDoc | SkillId): Promise<SkillSyncDoc> {
  let entity: SkillDoc;
  if (typeof entityOrId === "string") {
    entity = await _readOrThrow(ctx, { id: entityOrId })
  } else {
    entity = entityOrId
  }
  const { url } = await readTextureOrThrow(ctx, { id: entity.textureId });
  const llm = await readLLMOrThrow(ctx, entity.llmId)

  let mcpServerExs: McpServerExtendDoc[] | undefined = undefined
  if (entity.data.type === skillTypeMcpTool) {
    const mcpServerToolIds = entity.data.tools.map(t => t.id)
    let mcpServerTools = await listMcpServerToolsByIds(ctx, { ids: mcpServerToolIds })
    const mcpServerIds = [...new Set(mcpServerTools.map(t => t.mcpServerId))]
    mcpServerExs = await listMcpServersByIds(ctx, { ids: mcpServerIds })
  }
  return { ...entity, textureUrl: url, llm, mcpServerExs };
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

export async function _listSyncByIds(ctx: QueryMutationCtx, args: ListByIdsArgs) {
  const entitySyncs: SkillSyncDoc[] = await asyncMap(
    await _listByIds(ctx, args),
    async (entity) => {
      return await _readSyncByIdOrEntity(ctx, entity);
    }
  );
  return entitySyncs
}

export async function _listByTexture(ctx: QueryMutationCtx, args: ListByTextureArgs) {
  const { worldId, textureId } = args
  return await ctx.db.query(table).withIndex(indexName_ByWorldIdAndTextureId, (q) =>
    q
      .eq("worldId", worldId)
      .eq("textureId", textureId)
  ).collect();
}

export async function _listByLLM(ctx: QueryMutationCtx, args: ListByLLMArgs) {
  const { worldId, llmId } = args
  return await ctx.db.query(table).withIndex(indexName_ByWorldIdAndLLMId, (q) =>
    q
      .eq("worldId", worldId)
      .eq("llmId", llmId)
  ).collect();
}

export async function _listByMcpServerTool(ctx: QueryMutationCtx, args: ListByMcpServerToolArgs) {
  const { worldId, mcpServerToolId } = args
  const entities = await ctx.db.query(table).withIndex(indexName_ByWorldIdAndType, (q) =>
    q
      .eq("worldId", worldId)
      .eq("data.type", skillTypeMcpTool)
  ).collect();
  return entities.filter(e => e.data.type === skillTypeMcpTool && e.data.tools.some(t => t.id === mcpServerToolId))
}

export async function _listByMcpServerTools(ctx: QueryMutationCtx, args: ListByMcpServerToolsArgs) {
  const { worldId, ids } = args
  const entities = await ctx.db.query(table).withIndex(indexName_ByWorldIdAndType, (q) =>
    q
      .eq("worldId", worldId)
      .eq("data.type", skillTypeMcpTool)
  ).collect();
  return entities.filter(e => e.data.type === skillTypeMcpTool && e.data.tools.some(t => ids.includes(t.id)))
}

/*** mutation helper ***/

export async function _create(ctx: MutationCtx, args: InsertArgs) {
  const modifyTime = +new Date()
  return await ctx.db.insert(table, { ...args, modifyTime });
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
    "name", "textureId", "llmId", "data")

  if (needNotifyUpstream) {
    const characters = await ctx.runQuery(api.world.character.query.listBySkill, { worldId: entity.worldId, skillId: entity._id })
    await Promise.all(characters.map(async (character) => {
      await ctx.runMutation(internal.world.character.mutation.updateModifyTime, { id: character._id })
    }))
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
    "name", "textureId", "llmId", "data")

  if (needNotifyUpstream) {
    const characters = await ctx.runQuery(api.world.character.query.listBySkill, { worldId: entity.worldId, skillId: entity._id })
    await Promise.all(characters.map(async (character) => {
      await ctx.runMutation(internal.world.character.mutation.updateModifyTime, { id: character._id })
    }))
  }
}

export async function _delete(ctx: MutationCtx, args: DeleteArgs) {
  const { id } = args
  const entity = await ctx.db.get(id);
  if (!entity) {
    throw new Error(`Invalid \`${table}\` ID: ${args.id}`);
  }
  const characters = await ctx.runQuery(api.world.character.query.listBySkill, { worldId: entity.worldId, skillId: entity._id })
  if (characters.length > 0) {
    throw new ConvexError(`current skill reference by characters:[${characters.map(v => v.name).join()}]`);
  }
  await ctx.db.delete(id);
}

export async function _batchUpdateModifyTime(ctx: MutationCtx, args: BatchUpdateTimeArgs) {
  const modifyTime = +new Date()
  const { ids } = args
  for (const id of ids) {
    await ctx.db.patch(id, { modifyTime });
  }
}