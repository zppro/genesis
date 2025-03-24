import { query } from '../../_generated/server';
import {
  _read, _readExByIdOrEntity, _readSyncByIdOrEntity, _list, _listByIds,
  _listEx, _listByTexture, _listByLLM, _listByMcpServerTool, _listByMcpServerTools
} from './helper';
import {
  readArgs, listArgs, listByIdsArgs,
  listByTextureArgs, listByLLMArgs, listByMcpServerToolArgs, listByMcpServerToolsArgs
} from "./args";


export const read = query({
  args: readArgs,
  handler: async (ctx, args) => {
    return await _read(ctx, args);
  },
});

export const readEx = query({
  args: readArgs,
  handler: async (ctx, args) => {
    return await _readExByIdOrEntity(ctx, args.id);
  },
});

export const readSync = query({
  args: readArgs,
  handler: async (ctx, args) => {
    return await _readSyncByIdOrEntity(ctx, args.id);
  },
});

export const list = query({
  args: listArgs,
  handler: async (ctx, args) => {
    return await _list(ctx, args);
  },
});

export const listEx = query({
  args: listArgs,
  handler: async (ctx, args) => {
    return await _listEx(ctx, args);
  },
});

export const listByIds = query({
  args: listByIdsArgs,
  handler: async (ctx, args) => {
    return await _listByIds(ctx, args);
  },
});

export const listByTexture = query({
  args: listByTextureArgs,
  handler: async (ctx, args) => {
    return await _listByTexture(ctx, args);
  },
});

export const listByLLM = query({
  args: listByLLMArgs,
  handler: async (ctx, args) => {
    return await _listByLLM(ctx, args);
  },
});

export const listByMcpServerTool = query({
  args: listByMcpServerToolArgs,
  handler: async (ctx, args) => {
    return await _listByMcpServerTool(ctx, args);
  },
});

export const listByMcpServerTools = query({
  args: listByMcpServerToolsArgs,
  handler: async (ctx, args) => {
    return await _listByMcpServerTools(ctx, args);
  },
});