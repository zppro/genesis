import { ConvexError } from 'convex/values';
import { QueryMutationCtx } from '../../shared/context';
import { MutationCtx } from '../../_generated/server';
import {
  table, McpServerToolDoc, McpServerToolId,
  indexName_ByWorldId, indexName_ByMcpServerId, indexName_ByMcpServerIdAndName,
} from "./schema";
import {
  ReadArgs, ReadByMcpServerAndNameArgs, ListArgs, ListByIdsArgs, ListByMcpServerArgs,
  InsertArgs, UpdateArgs, PatchArgs, DeleteArgs, BatchDeleteArgs,
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

  let needNotifyUpstream = checkNeedNotifyUpstream(entity, patchData,
    "name", "desc", "inputSchema")
  if (needNotifyUpstream) {
    const skills = await ctx.runQuery(api.world.skill.query.listByMcpServerTool, { worldId: entity.worldId, mcpServerToolId: entity._id })
    const ids = skills.map(s => s._id)
    await ctx.runMutation(internal.world.skill.mutation.batchUpdateSyncTime, { ids })
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
    "name", "desc", "inputSchema")
  if (needNotifyUpstream) {
    const skills = await ctx.runQuery(api.world.skill.query.listByMcpServerTool, { worldId: entity.worldId, mcpServerToolId: entity._id })
    const ids = skills.map(s => s._id)
    await ctx.runMutation(internal.world.skill.mutation.batchUpdateSyncTime, { ids })
  }
}

export async function _delete(ctx: MutationCtx, args: DeleteArgs) {
  const { id } = args
  const entity = await ctx.db.get(id);
  if (!entity) {
    throw new Error(`Invalid \`${table}\` ID: ${args.id}`);
  }
  const skills = await ctx.runQuery(api.world.skill.query.listByMcpServerTool, { worldId: entity.worldId, mcpServerToolId: entity._id })
  if (skills.length > 0) {
    throw new ConvexError(`current mcpServerTool reference by skills:[${skills.map(v => v.name).join()}]`);
  }
  await ctx.db.delete(id);
}

export async function _batchDelete(ctx: MutationCtx, args: BatchDeleteArgs) {
  const skills = await ctx.runQuery(api.world.skill.query.listByMcpServerTools, args)
  if (skills.length > 0) {
    throw new ConvexError(`have mcpServerTools reference by skills:[${skills.map(v => v.name).join()}]`);
  }
  for (const id of args.ids) {
    await ctx.db.delete(id);
  }
}

export async function _batchSequenceUpsert(ctx: MutationCtx, args: InsertArgs[]) {
  const modifyTime = +new Date()
  const batchUpsertedIds: McpServerToolId[] = []
  for (const itemArgs of args) {
    const entity = await _readByMcpServerAndName(ctx, itemArgs)
    if (entity) {
      // 更新数据
      // await ctx.db.patch(entity._id, { ...itemArgs, modifyTime });
      await _update(ctx, { id: entity._id, ...itemArgs })
      batchUpsertedIds.push(entity._id)
    } else {
      // 新数据不用修改上游引用skill
      batchUpsertedIds.push(
        await ctx.db.insert(table, { ...itemArgs, modifyTime })
      )
    }
  }
  return batchUpsertedIds;
}