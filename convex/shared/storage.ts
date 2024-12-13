import { v } from 'convex/values';
import { Id } from "../_generated/dataModel";
import { mutation, query } from '../_generated/server';

export const storageTable = '_storage';
export type StorageTable = typeof storageTable
export type StorageId = Id<StorageTable>

export const idStorage = v.id(storageTable)

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const generateDownloadUrl = query({
  args: { id: idStorage },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.id);
  },
});