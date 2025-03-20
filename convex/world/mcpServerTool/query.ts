import { query } from '../../_generated/server';
import { _read, _readByMcpServerAndName, _list, _listByIds, _listByMcpServer } from './helper';
import { readArgs, readByMcpServerAndNameArgs, listArgs, listByIdsArgs, listByMcpServerArgs } from "./args";


export const read = query({
  args: readArgs,
  handler: async (ctx, args) => {
    return await _read(ctx, args);
  },
});

export const readByMcpServerAndName = query({
  args: readByMcpServerAndNameArgs,
  handler: async (ctx, args) => {
    return await _readByMcpServerAndName(ctx, args);
  },
});

export const list = query({
  args: listArgs,
  handler: async (ctx, args) => {
    return await _list(ctx, args);
  },
});

export const listByIds = query({
  args: listByIdsArgs,
  handler: async (ctx, args) => {
    return await _listByIds(ctx, args);
  },
});

export const listByMcpServer = query({
  args: listByMcpServerArgs,
  handler: async (ctx, args) => {
    return await _listByMcpServer(ctx, args);
  },
});