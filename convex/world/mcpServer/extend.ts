import { McpServerDoc } from "./schema";
import { McpServerToolDoc } from "../mcpServerTool/schema";

export type McpServerExtendDoc = McpServerDoc & {
  mcpServerTools: McpServerToolDoc[]
};