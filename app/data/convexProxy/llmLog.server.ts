import { PaginationOptions } from "convex/server";
import { proxy } from "~/data/convexProxy/index.server"
import { api } from "@/_generated/api";
import { type LLMId } from "@/world/llms"
import type { LLMLogId, InsertArgs, UpdateArgs, DeleteArgs } from "@/log/llmLogs";
// import { parseNotFoundRecordError, parseConvexError } from "@/error";

export const getLLMLog = async (id: LLMLogId) => {
  return await proxy().query(api.log.llmLogs.read, { id })
}


export const listLLMLogs = async (llmId: LLMId) => {
  return await proxy().query(api.log.llmLogs.list, { llmId })
}

export const pageLLMLogs = async (llmId: LLMId, opts: PaginationOptions = { numItems: 10, cursor: null }) => {
  return await proxy().query(api.log.llmLogs.page, { llmId, opts })
}
