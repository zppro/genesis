import { query } from '../../_generated/server';
import { _read, _list, _listByIds } from './helper';
import { readArgs, listArgs, listByIdsArgs } from "./args";


export const read = query({
  args: readArgs,
  handler: async (ctx, args) => {
    return await _read(ctx, args);
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