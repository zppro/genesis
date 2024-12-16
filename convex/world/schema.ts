import { defineSchema, defineTable } from "convex/server";
import { table as characterTable, tableSchema as characterTableSchema } from "./characters"
import { table as sceneTable, tableSchema as sceneTableSchema } from "./scenes"
import { table as resourceTable, tableSchema as resourceTableSchema } from "./resources"
import { table as textureTable, tableSchema as textureTableSchema } from "./textures"


export const worldTables = {
  [characterTable]: characterTableSchema,
  [resourceTable]: resourceTableSchema,
  [sceneTable]: sceneTableSchema,
  [textureTable]: textureTableSchema,
};