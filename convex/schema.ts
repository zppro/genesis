import { defineSchema, defineTable } from "convex/server";

import { table as userTable, tableSchema as userTableSchema } from "./users"
import { table as worldTable, tableSchema as worldTableSchema } from "./worlds"
import { dataTables } from "./data/schema";
import { logTables } from "./log/schema";
import { worldTables } from "./world/schema";

export default defineSchema({
  [userTable]: userTableSchema,
  [worldTable]: worldTableSchema,
  ...dataTables,
  ...logTables,
  ...worldTables,
});
