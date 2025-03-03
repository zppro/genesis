import { format } from "date-fns/format"
import { useLoaderData } from "@remix-run/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { Separator } from "~/components/ui/separator"
import { getWorldSkillExtend } from "~/data/convexProxy/skill.server"
import { type SkillId, table } from "@/world/skill/schema";
import { GetOneErrorBoundary } from "~/components/error-boundary"
import { parseIsNotFoundRecordError } from "@/error";
import JsonPretty from "~/components/ui/json-pretty";
import { ScrollArea } from "~/components/ui/scroll-area"
import Toolbar from "~/components/toolbars/entity-detail-toolbar";
// import ToolItem from "~/components/toolbars/tool-item";
import { ImageDialog } from "~/components/ui/image-dialog";
import { Handle } from "~/lib/routeHandle";
import { breadcrumb } from "~/components/app-breadcrumb";


export const handle: Handle = {
  breadcrumb
};

export async function loader({
  params,
}: LoaderFunctionArgs) {
  const { worldId, skillId } = params;
  let skillEx = null
  try {
    skillEx = await getWorldSkillExtend(skillId as SkillId)
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
    if (skillEx === null) {
      throw new Response(null, {
        status: 404,
        statusText: "Not Found",
      });
    }
    const breadcrumbData = { routeName: skillEx.name, routeUrl: `/world/${worldId}/skill/${skillId}` }

    return { ...breadcrumbData, skillEx }
  }
}

export function ErrorBoundary() {
  return <GetOneErrorBoundary />
}

export default function Index() {
  const { skillEx } = useLoaderData<typeof loader>();

  return (
    <div className="flex h-full items-start flex-col">
      <Toolbar entityName={table}>
      </Toolbar>
      <Separator />
      <div className="w-full flex flex-1 flex-col">
        <div className="w-full flex items-start flex-row p-4 ">
          <div className="font-semibold text-lg">{skillEx?.name}</div>
          {skillEx._creationTime && (
            <div className="ml-auto text-xs h-full text-muted-foreground flex items-center">
              {format(new Date(skillEx._creationTime), "PPpp")}
            </div>
          )}
        </div>
        <Separator />
        <ScrollArea className="p-4 h-full w-full max-h-[calc(100vh-200px)]">
          <div className="flex flex-col space-y-2">
            <div>
              <ImageDialog src={skillEx?.textureUrl} maxWidth={400} maxHeight={300} />
            </div>
            {/* <div className="whitespace-pre-wrap"><JsonPretty data={data} className="w-[520px]" /></div> */}
          </div>
        </ScrollArea>
        <Separator className="mt-auto" />
        <div className="p-2">
        </div>
      </div>
    </div>
  )
}