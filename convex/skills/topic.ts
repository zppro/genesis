import { ConvexError } from "convex/values";
import { z } from "zod"
import { createFunctionHandler } from "openai-zod-functions";

export const functions = [
  createFunctionHandler({
    name: "randomPickTopicHardcoded",
    description: "从预定义的话题库中随机挑选一个话题",
    schema: z.object({}),
    handler: async (args) => {
      console.log("randomPickTopicHardcoded args:", args)
      const topics = [
        "今天天气真好",
        "我应该去散散步",
        "不知道其他人在做什么",
        "也许该找个人聊聊",
        "有点饿了",
        "这个地方真漂亮"
      ];
      const data = topics[Math.floor(Math.random() * topics.length)];
      return {
        data
      }
    }
  })
]