import { action } from "../_generated/server";
import { internal } from "../_generated/api"
import { v } from "convex/values";
import { idLLM } from "./llms";


export const runLLM = action({
  args: {
    llmId: idLLM,
    system: v.string(),
    user: v.string(),
  },
  handler: async (ctx, args) => {
    const {llmId, system, user} = args;
    const llm = await ctx.runQuery(internal.world.llms._read, {id: llmId});

    // do something with `data`
  },
});


