import { format } from "date-fns/format"
import { useLoaderData, Outlet, Link, redirect, useLocation } from "@remix-run/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { Separator } from "~/components/ui/separator"
import { getWorldSceneExtend } from "~/data/convexProxy/scene.server"
import { type SceneId, table } from "@/world/scenes";
import { GetOneErrorBoundary } from "~/components/error-boundary"
import { parseIsNotFoundRecordError } from "@/error";
import Toolbar from "~/components/toolbars/entity-detail-toolbar";
import { ScrollArea } from "~/components/ui/scroll-area"
import { cn } from "~/lib/utils";

export async function loader({
  params,
  request,
}: LoaderFunctionArgs) {
  const { worldId, sceneId } = params;
  let url = new URL(request.url);
  if (url.pathname === `/world/${worldId}/scene/${sceneId}`) {
    return redirect(`basic`);
  }

  let sceneEx = null
  try {
    sceneEx = await getWorldSceneExtend(sceneId as SceneId)
  } catch (error) {
    let isNotFoundError = parseIsNotFoundRecordError(error)
    if (isNotFoundError) {
      throw new Response(null, {
        status: 404,
        statusText: "Not Found",
      });
    }
    throw error
  } finally {
    if (sceneEx === null) {
      throw new Response(null, {
        status: 404,
        statusText: "Not Found",
      });
    }
    console.log('scene id load')
    return { sceneEx }
  }
}

export function ErrorBoundary() {
  return <GetOneErrorBoundary />
}

export default function Index() {
  const { sceneEx } = useLoaderData<typeof loader>();
  const location = useLocation();
  const tabValue = location.pathname.substring(location.pathname.lastIndexOf("/") + 1)
  return (
    <div className="flex h-full items-start flex-col">
      <Toolbar entityName={table} />
      <Separator />
      <div className="w-full flex flex-1 flex-col">
        <div className="w-full flex items-start flex-row p-4 ">
          <div className="font-semibold text-lg">{sceneEx?.name}</div>
          {sceneEx?._creationTime && (
            <div className="ml-auto text-xs h-full text-muted-foreground flex items-center">
              {format(new Date(sceneEx._creationTime), "PPpp")}
            </div>
          )}
        </div>
        <Separator />
        <div className="pt-2 tabs">
          <Link to="basic" prefetch="render" className={cn("tab basis-1/5", tabValue === 'basic' ? 'active-tab' : null)} >Basic</Link>
          <Link to="tilemap" prefetch="render" className={cn("tab basis-1/5", tabValue === 'tilemap' ? 'active-tab' : null)}>Tilemap</Link>
          <Link to="npcs" prefetch="render" className={cn("tab basis-1/5", tabValue === 'npc' ? 'active-tab' : null)}>NPCs</Link>
          <Link to="animations" prefetch="render" className={cn("tab basis-1/5", tabValue === 'animations' ? 'active-tab' : null)}>Animations</Link>
          {/* <div className="flex-1 border-gray-500"></div> */}
        </div>
        {/* <ScrollArea className="h-full w-full max-h-[calc(100vh-230px)] p-4 flex-1 flex flex-col">
        
        </ScrollArea> */}
        <Outlet />
        <Separator className="mt-auto" />
        <div className="p-2">
        </div>
      </div>
    </div>
  )
}