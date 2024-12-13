import { defineSchema, defineTable } from "convex/server";
import { table as characterTable, tableSchema as characterTableSchema } from "./characters"
import { table as sceneTable, tableSchema as sceneTableSchema } from "./scenes"
import { table as resourceTable, tableSchema as resourceTableSchema } from "./resources"


export const worldTables = {
  [characterTable]: characterTableSchema,
  [resourceTable]: resourceTableSchema,
  [sceneTable]: sceneTableSchema,
};