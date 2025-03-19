import { query } from '../../../_generated/server';
import { _read, _readByName, _readByServerSession, _list } from './helper';
import { readArgs, readByNameArgs, readByServerSessionArgs } from "./args";


export const read = query({
  args: readArgs,
  handler: async (ctx, args) => {
    return await _read(ctx, args);
  },
});

export const readByName = query({
  args: readByNameArgs,
  handler: async (ctx, args) => {
    return await _readByName(ctx, args);
  },
});

export const readByServerSession = query({
  args: readByServerSessionArgs,
  handler: async (ctx, args) => {
    return await _readByServerSession(ctx, args);
  },
});

export const list = query({
  handler: async (ctx) => {
    return await _list(ctx);
  },
});
