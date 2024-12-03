import { defineSchema, defineTable } from "convex/server";

import { table as userTable, tableSchema as userTableSchema } from "./users"
import { table as worldTable, tableSchema as worldTableSchema } from "./worlds"
import { table as sceneTable, tableSchema as sceneTableSchema } from "./world/scenes"

export default defineSchema({
  [userTable]: userTableSchema,
  [worldTable]: worldTableSchema,
  [sceneTable]: sceneTableSchema,
});
