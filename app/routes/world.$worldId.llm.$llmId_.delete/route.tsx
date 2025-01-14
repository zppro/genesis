import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { deleteWorldLLM } from "~/data/convexProxy/llm.server"
import { type LLMId } from "@/world/llms";
export const action = async ({
  params,
}: ActionFunctionArgs) => {
  const { worldId, llmId } = params;
  await deleteWorldLLM({ id: llmId as LLMId });
  return redirect(`/world/${worldId}/llm`);
};