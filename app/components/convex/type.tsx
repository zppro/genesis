import { TableNames } from "@/_generated/dataModel";
import { SystemTableNames } from "convex/server"
export type FormErrors = Record<string, any>
export type ClientErrors = Record<string, any>
export type ServerErrors = Record<string, any>

export type ConvexTables = TableNames | SystemTableNames

export type ConvexDocTables = TableNames


