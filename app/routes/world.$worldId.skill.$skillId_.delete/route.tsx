import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { deleteWorldSkill } from "~/data/convexProxy/skill.server"
import { type SkillId } from "@/world/skill/schema";
import { ConvexError } from "convex/values";


export const action = async ({
  params,
}: ActionFunctionArgs) => {
  const { worldId, skillId } = params;
  try {
    await deleteWorldSkill({ id: skillId as SkillId });
  } catch (e) {
    if (e instanceof ConvexError) {
      throw new Response(e.data, {
        status: 500,
      })
    } else {
      throw new Error("Something went wrong!");
    }
  }

  return redirect(`/world/${worldId}/skill`);
};