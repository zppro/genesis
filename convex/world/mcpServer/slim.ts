import { v, Infer } from "convex/values"
import {idMcpServer, mcpServerFields} from "./schema"

export const slimServer = v.object({
  id: idMcpServer,
  name: mcpServerFields.name,
})
export type SlimServer = Infer<typeof slimServer>