import { defineSchema, defineTable } from "convex/server";
import { table as characterTable, tableSchema as characterTableSchema } from "./character/schema"
import { table as llmTable, tableSchema as llmTableSchema } from "./llms"
import { table as mcpServerTable, tableSchema as mcpServerTableSchema } from "./mcpServer/schema"
import { table as mcpServerToolTable, tableSchema as mcpServerToolTableSchema } from "./mcpServerTool/schema"
import { table as sceneTable, tableSchema as sceneTableSchema } from "./scenes"
import { table as sceneAnimationTable, tableSchema as sceneAnimationTableSchema } from "./sceneAnimations"
import { table as sceneNPCTable, tableSchema as sceneNPCTableSchema } from "./sceneNPCs"
import { table as objectTable, tableSchema as objectTableSchema } from "./objects"
import { table as resourceTable, tableSchema as resourceTableSchema } from "./resources"
import { table as skillTable, tableSchema as skillTableSchema } from "./skill/schema";
import { table as spritesheetTable, tableSchema as spritesheetTableSchema } from "./spritesheets"
import { table as textureTable, tableSchema as textureTableSchema } from "./textures"
import { table as eventTable, tableSchema as eventTableSchema } from "./events";


export const worldTables = {
  [characterTable]: characterTableSchema,
  [eventTable]: eventTableSchema, // 修改为 events 表
  [llmTable]: llmTableSchema,
  [mcpServerTable]: mcpServerTableSchema,
  [mcpServerToolTable]: mcpServerToolTableSchema,
  [objectTable]: objectTableSchema,
  [resourceTable]: resourceTableSchema,
  [sceneTable]: sceneTableSchema,
  [sceneAnimationTable]: sceneAnimationTableSchema,
  [sceneNPCTable]: sceneNPCTableSchema,
  [skillTable]: skillTableSchema,
  [spritesheetTable]: spritesheetTableSchema,
  [textureTable]: textureTableSchema,
};