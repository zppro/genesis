import { query } from '../../_generated/server';
import {
  _read, _readExByIdOrEntity, _readSyncByIdOrEntity,
  _list, _listEx, _listBySpritesheet, _listBySkill
} from './helper';
import { readArgs, listArgs, listBySpritesheetArgs, listBySkillArgs } from "./args";


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

export const listBySpritesheet = query({
  args: listBySpritesheetArgs,
  handler: async (ctx, args) => {
    return await _listBySpritesheet(ctx, args);
  },
});

export const listBySkill = query({
  args: listBySkillArgs,
  handler: async (ctx, args) => {
    return await _listBySkill(ctx, args);
  },
});