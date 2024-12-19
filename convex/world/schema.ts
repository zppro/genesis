import { defineSchema, defineTable } from "convex/server";
import { table as characterTable, tableSchema as characterTableSchema } from "./characters"
import { table as sceneTable, tableSchema as sceneTableSchema } from "./scenes"
import { table as objectTable, tableSchema as objectTableSchema } from "./objects"
import { table as resourceTable, tableSchema as resourceTableSchema } from "./resources"
import { table as spritesheetTable, tableSchema as spritesheetTableSchema } from "./spritesheets"
import { table as textureTable, tableSchema as textureTableSchema } from "./textures"


export const worldTables = {
  [characterTable]: characterTableSchema,
  [objectTable]: objectTableSchema,
  [resourceTable]: resourceTableSchema,
  [sceneTable]: sceneTableSchema,
  [spritesheetTable]: spritesheetTableSchema,
  [textureTable]: textureTableSchema,
};