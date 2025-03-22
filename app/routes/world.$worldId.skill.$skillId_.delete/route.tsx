import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { deleteWorldSkill } from "~/data/convexProxy/skill.server"
import { type SkillId } from "@/world/skill/schema";
import { ConvexError } from "convex/values";


export const action = async ({
  request,
  params,
}: ActionFunctionArgs) => {
  const { worldId, skillId } = params;
  let notifyUrl = `/world/${worldId}/skill`
  const actionUrl = new URL(request.url).pathname;
  try {
    await deleteWorldSkill({ id: skillId as SkillId });
  } catch (e) {
    if (e instanceof ConvexError) {
      // throw new Response(e.data, {
      //   status: 500,
      // })
      console.log('e.data=>', e.data)
      notifyUrl = notifyUrl + `/${skillId}`
      return redirect(`${notifyUrl}?_notifyUrl=${notifyUrl}&_actionUrl=${actionUrl}&_err=${encodeURIComponent(e.data)}`);
    } else {
      throw new Error("Something went wrong!");
    }
  }

  return redirect(`${notifyUrl}?_notifyUrl=${notifyUrl}&_actionUrl=${actionUrl}`);
};