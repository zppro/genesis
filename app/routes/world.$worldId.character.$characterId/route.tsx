import { format } from "date-fns/format"
import { useLoaderData } from "@remix-run/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { Separator } from "~/components/ui/separator"
import { getWorldCharacterExtend } from "~/data/convexProxy/character.server"
import { type CharacterId, table } from "@/world/characters";
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
  const { characterId } = params;
  let characterEx = null
  try {
    characterEx = await getWorldCharacterExtend(characterId as CharacterId)
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
    if (characterEx === null) {
      throw new Response(null, {
        status: 404,
        statusText: "Not Found",
      });
    }

    return { characterEx }
  }
}

export function ErrorBoundary() {
  return <GetOneErrorBoundary />
}

export default function Index() {
  const { characterEx } = useLoaderData<typeof loader>();

  return (
    <div className="flex h-full items-start flex-col">
      <Toolbar entityName={table} />
      <Separator />
      <div className="w-full flex flex-1 flex-col">
        <div className="w-full flex items-start flex-row p-4 ">
          <div className="font-semibold text-lg">{characterEx?.name} <Badge>speed:{characterEx?.speed}</Badge></div>
          {characterEx?._creationTime && (
            <div className="ml-auto text-xs h-full text-muted-foreground flex items-center">
              {format(new Date(characterEx._creationTime), "PPpp")}
            </div>
          )}
        </div>
        <Separator />
        <div className="p-4">
          <ImageDialog src={characterEx?.texture.url} maxWidth={400} maxHeight={300} />
        </div>
        <div className="flex-1 h-full whitespace-pre-wrap p-4 text-sm flex flex-col">
          <ScrollArea className="h-full w-full flex-1 max-h-[calc(100vh-540px)]">
            <JsonPretty data={characterEx?.spritesheet?.data} />
          </ScrollArea>
        </div>
        <Separator className="mt-auto" />
        <div className="p-2">
        </div>
      </div>
    </div>
  )
}