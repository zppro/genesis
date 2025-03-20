import { ConvexError } from 'convex/values';
import { QueryMutationCtx } from '../../shared/context';
import { MutationCtx } from '../../_generated/server';
import {
  table, McpServerToolDoc, McpServerToolId,
  indexName_ByWorldId, indexName_ByMcpServerId, indexName_ByMcpServerIdAndName,
} from "./schema";
import {
  ReadArgs, ReadByMcpServerAndNameArgs, ListArgs, ListByIdsArgs, ListByMcpServerArgs,
  InsertArgs, UpdateArgs, PatchArgs, DeleteArgs,
} from "./args";
// import { api, internal } from "../../_generated/api";
// import { checkNeedNotifyUpstream } from "../../shared/sync";
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

export async function _readByMcpServerAndName(ctx: QueryMutationCtx, args: ReadByMcpServerAndNameArgs) {
  const { mcpServerId, name } = args
  return await ctx.db.query(table).withIndex(indexName_ByMcpServerIdAndName, (q) =>
    q
      .eq("mcpServerId", mcpServerId)
      .eq("name", name)
  ).first();
}

export async function _list(ctx: QueryMutationCtx, args: ListArgs) {
  const { worldId } = args;
  return await ctx.db.query(table)
    .withIndex(indexName_ByWorldId, (q) => q.eq("worldId", worldId))
    .collect();
}

export async function _listByIds(ctx: QueryMutationCtx, args: ListByIdsArgs) {
  const { ids } = args
  // may be db.get(id) faster than  filter ids
  const entities = await Promise.all(ids.map(async (id) => {
    return await ctx.db.get(id)
  }))
  return entities.filter(v => !!v)
}

export async function _listByMcpServer(ctx: QueryMutationCtx, args: ListByMcpServerArgs) {
  const { mcpServerId } = args
  return await ctx.db.query(table).withIndex(indexName_ByMcpServerId, (q) =>
    q
      .eq("mcpServerId", mcpServerId)
  ).collect();
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

  // let needNotifyUpstream = checkNeedNotifyUpstream(entity, patchData,
  //   "name", "textureId", "llmId", "functionName", "systemPrompt")
  // if (needNotifyUpstream) {
  //   const characters = await ctx.runQuery(api.world.character.query.listBySkill, { worldId: entity.worldId, skillId: entity._id })
  //   await Promise.all(characters.map(async (character) => {
  //     await ctx.runMutation(internal.world.character.mutation.updateModifyTime, { id: character._id })
  //   }))
  // }
}

export async function _patch(ctx: MutationCtx, args: PatchArgs) {
  const { id, ...patchData } = args
  const entity = await ctx.db.get(id);
  if (!entity) {
    throw new Error(`Invalid \`${table}\` ID: ${args.id}`);
  }
  const modifyTime = +new Date()
  await ctx.db.patch(id, { ...patchData, modifyTime });

  // let needNotifyUpstream = checkNeedNotifyUpstream(entity, patchData,
  //   "name", "textureId", "llmId", "functionName", "systemPrompt")
  // if (needNotifyUpstream) {
  //   const characters = await ctx.runQuery(api.world.character.query.listBySkill, { worldId: entity.worldId, skillId: entity._id })
  //   await Promise.all(characters.map(async (character) => {
  //     await ctx.runMutation(internal.world.character.mutation.updateModifyTime, { id: character._id })
  //   }))
  // }
}

export async function _delete(ctx: MutationCtx, args: DeleteArgs) {
  const { id } = args
  const entity = await ctx.db.get(id);
  if (!entity) {
    throw new Error(`Invalid \`${table}\` ID: ${args.id}`);
  }
  // const characters = await ctx.runQuery(api.world.character.query.listBySkill, { worldId: entity.worldId, skillId: entity._id })
  // if (characters.length > 0) {
  //   throw new ConvexError(`current skill reference by characters:[${characters.map(v => v.name).join()}]`);
  // }
  await ctx.db.delete(id);
}


export async function _batchSequenceUpsert(ctx: MutationCtx, args: InsertArgs[]) {
  const modifyTime = +new Date()
  const batchUpsertedIds: McpServerToolId[] = []
  for (const itemArgs of args) {
    const entity = await _readByMcpServerAndName(ctx, itemArgs)
    if (entity) {
      await ctx.db.patch(entity._id, { ...itemArgs, modifyTime });
      batchUpsertedIds.push(entity._id)
    } else {
      batchUpsertedIds.push(
        await ctx.db.insert(table, { ...itemArgs, modifyTime })
      )
    }
  }
  return batchUpsertedIds;
}