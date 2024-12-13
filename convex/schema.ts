import { defineSchema, defineTable } from "convex/server";

import { table as userTable, tableSchema as userTableSchema } from "./users"
import { table as worldTable, tableSchema as worldTableSchema } from "./worlds"
import { worldTables } from "./world/schema";

export default defineSchema({
  [userTable]: userTableSchema,
  [worldTable]: worldTableSchema,
  ...worldTables,
});
