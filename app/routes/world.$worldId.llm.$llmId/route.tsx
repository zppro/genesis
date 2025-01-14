import { format } from "date-fns/format"
import { useLoaderData } from "@remix-run/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { Separator } from "~/components/ui/separator"
import { getWorldLLM } from "~/data/convexProxy/llm.server"
import { type LLMId, table } from "@/world/llms";
import { GetOneErrorBoundary } from "~/components/error-boundary"
import { parseIsNotFoundRecordError } from "@/error";
import Toolbar from "~/components/toolbars/entity-detail-toolbar";
import { ImageDialog } from "~/components/ui/image-dialog";
import { Handle } from "~/lib/routeHandle";
import { breadcrumb } from "~/components/app-breadcrumb";

export const handle: Handle = {
  breadcrumb
};

export async function loader({
  params,
}: LoaderFunctionArgs) {
  const { worldId, llmId } = params;
  let llm = null
  try {
    llm = await getWorldLLM(llmId as LLMId)
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
    if (llm === null) {
      throw new Response(null, {
        status: 404,
        statusText: "Not Found",
      });
    }
    const breadcrumbData = { routeName: llm.name, routeUrl: `/world/${worldId}/llm/${llmId}` }

    return { ...breadcrumbData, llm }
  }
}

export function ErrorBoundary() {
  return <GetOneErrorBoundary />
}

export default function Index() {
  const { llm } = useLoaderData<typeof loader>();

  return (
    <div className="flex h-full items-start flex-col">
      <Toolbar entityName={table} />
      <Separator />
      <div className="w-full flex flex-1 flex-col">
        <div className="w-full flex items-start flex-row p-4 ">
          <div className="font-semibold text-lg">{llm?.name}</div>
          {llm?._creationTime && (
            <div className="ml-auto text-xs h-full text-muted-foreground flex items-center">
              {format(new Date(llm.modifyTime), "PPpp")}
            </div>
          )}
        </div>
        <Separator />
        <div className="p-4">
          {llm?.baseUrl}
        </div>
        <div className="p-4">
          {llm?.apiKeyName}
        </div>
        <div className="flex-1 whitespace-pre-wrap p-4 text-sm">
          {llm?.desc}
        </div>
        <Separator className="mt-auto" />
        <div className="p-2">

        </div>
      </div>
    </div>
  )
}