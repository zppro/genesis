import { GenericActionCtx } from "convex/server";
import { action, internalMutation } from "../../_generated/server";
import { internal } from "../../_generated/api"
import { testSkillArgs } from "./args";
import { _readOrThrow as readSkillOrThrow } from "./helper";
import { idLLM, _readOrThrow as readLLMOrThrow } from "../llms";
import { _create as createLLMLog, _update as updateLLMLog, _patch as PatchLLMLog } from "../../log/llmLogs";
import { createFunctionHandler } from "openai-zod-functions";
import OpenAI from "openai";
import { ConvexError } from "convex/values";
import { handleToolCalls, ZodFunctionHandler, toTool, parseArguments } from "openai-zod-functions";
import { skillFunctions } from "../../skills";


export const _beforeTestSkill = internalMutation({
  args: testSkillArgs,
  handler: async (ctx, args) => {
    const { id, messages } = args;
    const skill = await readSkillOrThrow(ctx, { id });
    const { llmId } = skill;
    const { apiKeyName, baseUrl, model } = await readLLMOrThrow(ctx, llmId)
    const apiKey = process.env[apiKeyName]
    const reqRaw = {
      model,
      messages,
    }
    const llmLogId = await createLLMLog(ctx, { llmId, reqTime: +new Date(), reqRaw })

    return { apiKey, baseUrl, llmLogId, messages, model, skill }
  },
});

export const testSkill = action({
  args: testSkillArgs,
  handler: async (ctx, args) => {
    const { apiKey, baseUrl, llmLogId, messages, model, skill: { functionName } } = await ctx.runMutation(internal.world.skill.action._beforeTestSkill, args);

    const skillFunction = skillFunctions.find(v => v.name === functionName)
    if (!skillFunction) {
      throw new ConvexError(`function calling(${functionName}) is not found in predefined`);
    }

    const openai: any = new OpenAI({
      baseURL: baseUrl,
      apiKey,
    });
    // console.log("baseUrl=>", baseUrl)
    // console.log("apiKey=>", apiKey)
    // console.log("model=>", model)
    try {
      const tools = [skillFunction].map(toTool)
      // console.log("tools=>", JSON.stringify(tools))
      const toolsInLLMLog = tools.map(t => ({
        type: t.type,
        def: t,
      }))
      await ctx.runMutation(internal.world.llmsAction._updateLLMTools, { llmLogId, tools: toolsInLLMLog })

      const completion: any = await openai.chat.completions.create({
        messages,
        model,
        // Convert ZodFunctions for OpenAI
        tools,
      });
      // console.log("completion=>", JSON.stringify(completion))
      const { message } = completion.choices[0];
      if (!message.tool_calls || message.tool_calls.length === 0) {
        throw new ConvexError(`function calling(${skillFunction.name}) not used!`);
      }

      const func = message.tool_calls[0].function;
      if (func.name !== skillFunction.name) {
        throw new ConvexError(`function calling(${skillFunction.name}) not matched!`);
      }
      // console.log("func=>", func)
      const toolOutputs = await handleToolCalls([skillFunction], message.tool_calls);
      const { data } = toolOutputs[0];

      // this content is args parsed by llm
      // console.log("test skill ret:", data);
      // const content: string = JSON.stringify(data);
      const content: string = JSON.stringify(data, null, 2);
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
