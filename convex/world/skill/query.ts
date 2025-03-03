import { query } from '../../_generated/server';
import { _read, _readExByIdOrEntity, _list } from './helper';
import { readArgs, listArgs } from "./args";


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
