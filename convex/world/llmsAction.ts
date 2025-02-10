import { action, internalMutation } from "../_generated/server";
import { internal } from "../_generated/api"
import { ObjectType, v, ConvexError } from "convex/values";
import { idLLM, _readOrThrow } from "./llms";
import { _create, _update, idLLMLog } from "../log/llmLogs";
import { llmMessages, LLMMessages } from "../shared/type";
import OpenAI from "openai";
import { idWorld } from "../worlds";

export const runLLMArgs = {
  worldId: idWorld,
  llmId: idLLM,
  messages: llmMessages,
};

export type RunLLMArgs = ObjectType<typeof runLLMArgs>

export const _beforeRunLLM = internalMutation({
  args: runLLMArgs,
  handler: async (ctx, args) => {
    const { llmId, messages } = args;
    const { apiKeyName, baseUrl, model } = await _readOrThrow(ctx, llmId)
    const apiKey = process.env[apiKeyName]
    const reqRaw = {
      model,
      messages,
    }
    const llmLogId = await _create(ctx, { llmId, reqTime: +new Date(), reqRaw })
    return { apiKey, baseUrl, llmLogId, messages, model }
  },
});

export const runLLM = action({
  args: runLLMArgs,
  handler: async (ctx, args) => {
    const { apiKey, baseUrl, llmLogId, messages, model } = await ctx.runMutation(internal.world.llmsAction._beforeRunLLM, args);

    const openai: any = new OpenAI({
      baseURL: baseUrl,
      apiKey
    });
    try {
      const completion: any = await openai.chat.completions.create({
        messages,
        model,
      });
      console.log(completion.choices[0].message.content);
      const content = completion.choices[0].message.content as string
      await ctx.scheduler.runAfter(0, internal.world.llmsAction._afterRunLLM, {
        llmLogId,
        content,
        completion,
      });
      return content
    } catch (ex) {
      if (ex instanceof Error) {
        throw new ConvexError(`invoke llm err:${ex.message}`);
      } else {
        throw new ConvexError(ex as any)
      }
    }
  },
});

export const _afterRunLLM = internalMutation({
  args: { llmLogId: idLLMLog, content: v.string(), completion: v.any() },
  handler: async (ctx, args) => {
    const { llmLogId, content, completion } = args;
    await _update(ctx, { id: llmLogId, resTime: +new Date(), resContent: content, resRaw: completion })
  },
});

