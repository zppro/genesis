import { v, Infer } from "convex/values"
import {idMcpServerTool, mcpServerToolFields} from "./schema"


export const slimServerTool = v.object({
  id: idMcpServerTool,
  name: mcpServerToolFields.name,
})
export type SlimServerTool = Infer<typeof slimServerTool>