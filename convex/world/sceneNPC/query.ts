import { query } from '../../_generated/server';
import {
  _read, _readExByIdOrEntity, _readSyncByIdOrEntity,
  _listByIds, _listByScene, _listExByScene, _listSyncByScene, _listByCharacter,
} from './helper';
import { readArgs, listByIdsArgs, listBySceneArgs, listByCharacterArgs } from "./args";


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

export const listByIds = query({
  args: listByIdsArgs,
  handler: async (ctx, args) => {
    return await _listByIds(ctx, args);
  },
});

export const listByScene = query({
  args: listBySceneArgs,
  handler: async (ctx, args) => {
    return await _listByScene(ctx, args);
  },
});

export const listExByScene = query({
  args: listBySceneArgs,
  handler: async (ctx, args) => {
    return await _listExByScene(ctx, args);
  },
});

export const listSyncByScene = query({
  args: listBySceneArgs,
  handler: async (ctx, args) => {
    return await _listSyncByScene(ctx, args);
  },
});

export const listByCharacter = query({
  args: listByCharacterArgs,
  handler: async (ctx, args) => {
    return await _listByCharacter(ctx, args);
  },
});