"use node";

import { action } from "../../_generated/server";
import { testSkillArgs } from "./args";
import { createBMIClient } from "../../mcp/client/bmi";

export const testMcpSkillInNode = action({
  args: testSkillArgs,
  handler: async (ctx, args) => {
    console.log('testMcpSkillInNode..')
    const { id, messages } = args;
    const client = await createBMIClient(ctx, `https://proper-lapwing-331.convex.site/sse`)
    try {
      const tools = await client.listTools()
      console.log("tools=>", tools)
    } catch (err) {
      console.log('err=>', err)
    } finally {

      await client.close()
      console.log('close client successfully')
    }
  }
});