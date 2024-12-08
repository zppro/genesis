import { v } from 'convex/values';
import { Id } from "../_generated/dataModel";

export const storageTable = '_storage';
export type StorageTable = typeof storageTable
export type StorageId = Id<StorageTable>

export const idStorage = v.id(storageTable)

