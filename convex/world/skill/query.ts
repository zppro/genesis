import { query } from '../../_generated/server';
import { _read, _readExByIdOrEntity, _list, _listEx, _listByTexture, _listByLLM } from './helper';
import { readArgs, listArgs, listByTextureArgs, listByLLMArgs } from "./args";


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