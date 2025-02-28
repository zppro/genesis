import { action, internalMutation } from "../_generated/server";
import { internal } from "../_generated/api"
import { ObjectType, v, ConvexError } from "convex/values";
import { idLLM, _readOrThrow } from "./llms";
import { _create, _update, idLLMLog } from "../log/llmLogs";
import { llmMessages, LLMMessages } from "../shared/type";
import OpenAI from "openai";
import { ZodFunctionDef, toTool } from "openai-zod-functions";
import { idWorld } from "../worlds";
import { z } from "zod";
import json5 from "json5";

export const runLLMArgs = {
  worldId: idWorld,
  llmId: idLLM,
  messages: llmMessages,
};

export const runLLMWithFunctionCallingArgs = {
  ...runLLMArgs,
  funcName: v.string()
}

export type RunLLMArgs = ObjectType<typeof runLLMArgs>
export type RunLLMWithFunctionCallingArgs = ObjectType<typeof runLLMWithFunctionCallingArgs>

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

export const _afterRunLLM = internalMutation({
  args: { llmLogId: idLLMLog, content: v.string(), completion: v.any() },
  handler: async (ctx, args) => {
    const { llmLogId, content, completion } = args;
    await _update(ctx, { id: llmLogId, resTime: +new Date(), resContent: content, resRaw: completion })
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

export function parseArguments<Parameters>(
  name: string,
  args: string,
  schema: z.ZodType<Parameters, any, any>,
): Parameters {
  // Parse the arguments string to JSON (should be guaranteed)
  console.log('before JSON5 parse', args)
  console.log(json5.parse(args))
  console.log('before JSON parse', args)
  const parameters = JSON.parse(args);
  console.log('after JSON parse')
  // Then validate against the schema (not guaranteed, can hallucinate)
  const result = schema.safeParse(parameters);
  console.log('after schema safeParse')
  if (!result.success) {
    throw new ConvexError(`valid scheme ${name} err:${result.error}`);
  }

  return result.data;
}

// Define functions using Zod
const functions: ZodFunctionDef[] = [
  {
    name: "get_current_weather",
    description: "获取当地天气",
    schema: z.object({
      location: z.string().describe("所在城市, e.g. 杭州市"),
      format: z
        .enum(["摄氏度", "华氏温标"])
        .describe("要使用的温度单位。根据用户位置推断。")
    })
  }
];

export const runLLMWithFunctionCalling = action({
  args: runLLMWithFunctionCallingArgs,
  handler: async (ctx, args) => {
    const runLLMArgs = { ...args, funcName: undefined }
    const { apiKey, baseUrl, llmLogId, messages, model } = await ctx.runMutation(internal.world.llmsAction._beforeRunLLM, runLLMArgs);

    const targetFunc = functions.find(v => v.name === args.funcName)
    if (!targetFunc) {
      throw new ConvexError(`function calling(${args.funcName}) is not found in predefined:${functions.map(v => v.name).join()}`);
    }

    const openai: any = new OpenAI({
      baseURL: baseUrl,
      apiKey,
    });
    // console.log("baseUrl=>", baseUrl)
    // console.log("apiKey=>", apiKey)
    // console.log("model=>", model)
    try {
      const tools = functions.map(toTool)
      console.log("tools=>", JSON.stringify(tools))
      const completion: any = await openai.chat.completions.create({
        messages,
        model,
        // Convert ZodFunctions for OpenAI
        tools,
      });
      // console.log("completion=>", JSON.stringify(completion))
      const { message } = completion.choices[0];
      if (!message.tool_calls || message.tool_calls.length === 0) {
        throw new ConvexError(`function calling(${args.funcName}) not used!`);
      }

      const func = message.tool_calls[0].function;
      if (func.name !== targetFunc.name) {
        throw new ConvexError(`function calling(${args.funcName}) not matched!`);
      }
      // console.log("func=>", func)
      const parsedArgs = parseArguments(func.name, func.arguments, targetFunc.schema);
      const content = JSON.stringify(parsedArgs)
      // this content is args parsed by llm
      // console.log(content);
      await ctx.scheduler.runAfter(0, internal.world.llmsAction._afterRunLLM, {
        llmLogId,
        content,
        completion,
      });
      return content
    } catch (ex) {
      console.log('unecept ex:', ex)
      if (ex instanceof Error) {
        throw new ConvexError(`invoke llm err:${ex.message}`);
      } else {
        throw new ConvexError(ex as any)
      }
    }
  },
});



