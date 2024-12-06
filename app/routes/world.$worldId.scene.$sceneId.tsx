import { format } from "date-fns/format"
import { useLoaderData } from "@remix-run/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { Separator } from "~/components/ui/separator"
import { getWorldScene } from "~/data/convexProxy/scene.server"
import { type SceneId, table } from "@/world/scenes";
import { GetOneErrorBoundary } from "~/components/error-boundary"
import { parseIsNotFoundRecordError } from "@/error";

import Toolbar from "~/components/toolbars/entity-detail-toolbar";

export async function loader({
  params,
}: LoaderFunctionArgs) {
  const { sceneId } = params;
  try {
    const scene = await getWorldScene(sceneId as SceneId)
    return { scene }
  } catch (error) {
    let isNotFoundError = parseIsNotFoundRecordError(error)
    if (isNotFoundError) {
      throw new Response(null, {
        status: 404,
        statusText: "Not Found",
      });
    }
    throw error
  }
}

export function ErrorBoundary() {
  return <GetOneErrorBoundary />
}

export default function Index() {
  console.log("$sceneID page")
  const { scene } = useLoaderData<typeof loader>();
  return (
    <div className="flex h-full items-start flex-col">
      <Toolbar entityName={table} />
      <Separator />
      <div className="w-full flex flex-1 flex-col">
        <div className="w-full flex items-start flex-row p-4 ">
          <div className="font-semibold text-lg">{scene?.name}</div>
          {scene?._creationTime && (
            <div className="ml-auto text-xs h-full text-muted-foreground flex items-center">
              {format(new Date(scene._creationTime), "PPpp")}
            </div>
          )}
        </div>
        <Separator />
        <div className="flex-1 whitespace-pre-wrap p-4 text-sm">
          {scene?.desc}
        </div>
        <Separator className="mt-auto" />
        <div className="p-2">

        </div>
      </div>
    </div>
  )
}