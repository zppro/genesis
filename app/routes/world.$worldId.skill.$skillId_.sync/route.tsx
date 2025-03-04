import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { getWorldSkill, updateWorldSkillSyncTime } from "~/data/convexProxy/skill.server"
import { toJSON } from "@/shared/sync";
import { table, SkillId } from "@/world/skill/schema"
import { getWorld } from "~/data/convexProxy/world.server";
import { WorldId } from "@/worlds";
export const action = async ({
  params,
}: ActionFunctionArgs) => {
  const { worldId, skillId } = params;
  const world = await getWorld(worldId as WorldId)
  if (!world) {
    throw new Error("invalid world!");
  }
  if (!world.deploy) {
    throw new Error("not set deploy!");
  }

  const skill = await getWorldSkill(skillId as SkillId)
  if (!skill) {
    throw new Error("invalid character!");
  }
  const syncUrl = `${world.deploy.site}/sync`
  const payload = toJSON({ _id: skill._id, object: table, name: skill.name })
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
  console.log(`sync character("${skillId}") ok!`)

  await updateWorldSkillSyncTime({ id: skill._id })
  return redirect(`/world/${worldId}/skill/${skillId}`);
};