import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { getWorldLLM, updateWorldLLMSyncTime } from "~/data/convexProxy/llm.server"
import { toJSON } from "@/shared/sync";
import { table, LLMId } from "@/world/llms"
import { getWorld } from "~/data/convexProxy/world.server";
import { WorldId } from "@/worlds";
export const action = async ({
  params,
}: ActionFunctionArgs) => {
  const { worldId, llmId } = params;
  const world = await getWorld(worldId as WorldId)
  if (!world) {
    throw new Error("invalid world!");
  }
  if (!world.deploy) {
    throw new Error("not set deploy!");
  }

  const llm = await getWorldLLM(llmId as LLMId)
  if (!llm) {
    throw new Error("invalid llm!");
  }
  const syncUrl = `${world.deploy.site}/sync`
  const payload = toJSON({ _id: llm._id, object: table, name: llm.name })
  const rawResponse = await fetch(syncUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: payload
  });
  const result = await rawResponse.json();
  if (result.err) {
    throw new Error("sync failed!", result.err);
  }
  console.log(`sync llm("${llmId}") ok!`)

  await updateWorldLLMSyncTime({ id: llm._id })
  return redirect(`/world/${worldId}/llm/${llmId}`);
};