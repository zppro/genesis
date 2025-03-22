import { listWorldSkills } from "~/data/convexProxy/skill.server"
import { useLoaderData, Outlet } from "@remix-run/react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable"
import { type WorldId } from "@/worlds";
import { type LoaderFunctionArgs } from "@remix-run/node";
import SkillScrollList from "./list"
import { useRedirectToast, useRedirectToastExOld } from "~/hooks/use-redirectToast";
import { GetOneErrorBoundary } from "~/components/error-boundary"
import { Handle } from "~/lib/routeHandle";
import { breadcrumb } from "~/components/app-breadcrumb";

export const handle: Handle = {
  breadcrumb
};

export function ErrorBoundary() {
  return <GetOneErrorBoundary />
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { worldId } = params;
  if (!worldId) {
    throw new Error("invalid world params!");
  }
  const skills = await listWorldSkills(worldId as WorldId)
  const breadcrumbData = { routeName: "skill", routeUrl: `/world/${worldId}/skill` }
  return { ...breadcrumbData, worldId: worldId as WorldId, skills }
}

export default function Skill() {
  // useRedirectToastExOld("DELETE", `/delete`, "delete skill ok")
  useRedirectToast([{
    method: "DELETE",
    actionCheck: "/delete",
  }/*, {
    method: "POST",
    actionCheck: "/sync",
  }*/])
  const data = useLoaderData<typeof loader>();
  return (
    <>
      <ResizablePanelGroup
        direction="horizontal"
        className="h-full items-stretch"
      >
        <ResizablePanel defaultSize={25} minSize={25}>
          <SkillScrollList {...data} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={75}>
          <div className="h-full">
            <Outlet />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

    </>
  )
}