import { format } from "date-fns/format"
import { useLoaderData } from "@remix-run/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { Separator } from "~/components/ui/separator"
import { getWorldObjectExtend } from "~/data/convexProxy/object.server"
import { type ObjectId, table } from "@/world/objects";
import { GetOneErrorBoundary } from "~/components/error-boundary"
import { parseIsNotFoundRecordError } from "@/error";
import JsonPretty from "~/components/ui/json-pretty";
import { ScrollArea } from "~/components/ui/scroll-area"
import Toolbar from "~/components/toolbars/entity-detail-toolbar";
import { ImageDialog } from "~/components/ui/image-dialog";
import { Badge } from "~/components/ui/badge"


export async function loader({
  params,
}: LoaderFunctionArgs) {
  const { objectId } = params;
  let objectEx = null
  try {
    objectEx = await getWorldObjectExtend(objectId as ObjectId)
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
    if (objectEx === null) {
      throw new Response(null, {
        status: 404,
        statusText: "Not Found",
      });
    }

    return { objectEx }
  }
}

export function ErrorBoundary() {
  return <GetOneErrorBoundary />
}

export default function Index() {
  const { objectEx } = useLoaderData<typeof loader>();

  return (
    <div className="flex h-full items-start flex-col">
      <Toolbar entityName={table} />
      <Separator />
      <div className="w-full flex flex-1 flex-col">
        <div className="w-full flex items-start flex-row p-4 ">
          <div className="font-semibold text-lg">{objectEx?.name}<Badge className="ml-2">{objectEx?.type}</Badge></div>
          {objectEx?._creationTime && (
            <div className="ml-auto text-xs h-full text-muted-foreground flex items-center">
              {format(new Date(objectEx._creationTime), "PPpp")}
            </div>
          )}
        </div>
        <Separator />
        <ScrollArea className="p-4 h-full w-full max-h-[calc(100vh-200px)]">
          <div className="flex flex-col space-y-2">
            <div><ImageDialog src={objectEx?.texture.url} maxWidth={400} maxHeight={300} /></div>
            <div className="whitespace-pre-wrap"><JsonPretty data={objectEx?.spritesheet?.data} className="w-[520px]" /></div>
          </div>
        </ScrollArea>
        <Separator className="mt-auto" />
        <div className="p-2">
        </div>
      </div>
    </div>
  )
}