import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

import { userTable, userSerialized } from "./users"
import { worldTable, worldSerialized } from "./worlds"

export default defineSchema({
  [userTable]: defineTable(userSerialized).index("byExternalId", ["externalId"]),
  [worldTable]: defineTable(worldSerialized),
});
