import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { getWorldSkill, updateWorldSkillSyncTime } from "~/data/convexProxy/skill.server"
import { toJSON } from "@/shared/sync";
import { table, SkillId } from "@/world/skill/schema"
import { getWorld } from "~/data/convexProxy/world.server";
import { WorldId } from "@/worlds";
export const action = async ({
  request,
  params,
}: ActionFunctionArgs) => {
  const { worldId, skillId } = params;
  let notifyUrl = `/world/${worldId}/skill/${skillId}`
  const actionUrl = new URL(request.url).pathname;
  const redirectUrl = `${notifyUrl}?_notifyUrl=${notifyUrl}&_actionUrl=${actionUrl}`
  const world = await getWorld(worldId as WorldId)
  if (!world) {
    // throw new Error("invalid world!");
    return redirect(`${redirectUrl}&_err=invalid world!`);
  }
  if (!world.deploy) {
    // throw new Error("not set deploy!");
    return redirect(`${redirectUrl}&_err=not set deploy!`);
  }

  const skill = await getWorldSkill(skillId as SkillId)
  if (!skill) {
    return redirect(`${redirectUrl}&_err=invalid skill!`);
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
    return redirect(`${redirectUrl}&_err=${encodeURIComponent(result.err)}`);
  }
  console.log(`sync character("${skillId}") ok!`)

  await updateWorldSkillSyncTime({ id: skill._id })

  return redirect(redirectUrl);
};