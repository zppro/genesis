import { query } from '../../_generated/server';
import { _read, _readExByIdOrEntity, _list, _listByIds, _listEx, _listExByIds } from './helper';
import { readArgs, listArgs, listByIdsArgs } from "./args";


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


export const listExByIds = query({
  args: listByIdsArgs,
  handler: async (ctx, args) => {
    return await _listExByIds(ctx, args);
  },
});