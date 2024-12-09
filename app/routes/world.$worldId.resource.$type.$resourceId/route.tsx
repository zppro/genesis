import { format } from "date-fns/format"
import { useLoaderData } from "@remix-run/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { Separator } from "~/components/ui/separator"
import { getWorldResource } from "~/data/convexProxy/resource.server"
import { type ResourceId, table } from "@/world/resources";
import { GetOneErrorBoundary } from "~/components/error-boundary"
import { parseIsNotFoundRecordError } from "@/error";
import Toolbar from "~/components/toolbars/entity-detail-toolbar";

export async function loader({
  params,
}: LoaderFunctionArgs) {
  const { resourceId } = params;
  // let resource: ResourceDoc | null = null
  let resource = null
  try {
    resource = await getWorldResource(resourceId as ResourceId)
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
    if (resource === null) {
      throw new Response(null, {
        status: 404,
        statusText: "Not Found",
      });
    }
    return { resource }
  }
}

export function ErrorBoundary() {
  return <GetOneErrorBoundary />
}

export default function Index() {
  const { resource } = useLoaderData<typeof loader>();
  return (
    <div className="flex h-full items-start flex-col">
      <Toolbar entityName={table} />
      <Separator />
      <div className="w-full flex flex-1 flex-col">
        <div className="w-full flex items-start flex-row p-4 ">
          <div className="font-semibold text-lg">{resource?.name}</div>
          {resource?._creationTime && (
            <div className="ml-auto text-xs h-full text-muted-foreground flex items-center">
              {format(new Date(resource._creationTime), "PPpp")}
            </div>
          )}
        </div>
        <Separator />
        <div className="p-4">
          {resource?.url ? <img src={resource.url} className="resource-map" /> : null}
        </div>
        <div className="flex-1 whitespace-pre-wrap p-4 text-sm">
          {resource?.desc}
        </div>
        <Separator className="mt-auto" />
        <div className="p-2">

        </div>
      </div>
    </div>
  )
}