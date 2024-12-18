import { format } from "date-fns/format"
import { useLoaderData } from "@remix-run/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { Separator } from "~/components/ui/separator"
import { getWorldSpritesheet } from "~/data/convexProxy/spritesheet.server"
import { type SpritesheetId, table } from "@/world/spritesheets";
import { GetOneErrorBoundary } from "~/components/error-boundary"
import { parseIsNotFoundRecordError } from "@/error";
import JsonPretty from "~/components/ui/json-pretty";
import { ScrollArea } from "~/components/ui/scroll-area"
import Toolbar from "~/components/toolbars/entity-detail-toolbar";
import { ImageDialog } from "~/components/ui/image-dialog";
import { getWorldTexture } from "~/data/convexProxy/texture.server"
import { type TextureId } from "@/world/textures";

export async function loader({
  params,
}: LoaderFunctionArgs) {
  const { spritesheetId } = params;
  let spritesheet = null
  try {
    spritesheet = await getWorldSpritesheet(spritesheetId as SpritesheetId)
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
    if (spritesheet === null) {
      throw new Response(null, {
        status: 404,
        statusText: "Not Found",
      });
    }
    let texture = null
    const { textureId } = spritesheet
    try {
      texture = await getWorldTexture(textureId as TextureId)
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
      if (texture === null) {
        throw new Response(null, {
          status: 404,
          statusText: "Not Found",
        });
      }
    }
    return { spritesheet, texture }
  }
}

export function ErrorBoundary() {
  return <GetOneErrorBoundary />
}

export default function Index() {
  const { spritesheet, texture } = useLoaderData<typeof loader>();

  return (
    <div className="flex h-full items-start flex-col">
      <Toolbar entityName={table} />
      <Separator />
      <div className="w-full flex flex-1 flex-col">
        <div className="w-full flex items-start flex-row p-4 ">
          <div className="font-semibold text-lg">{spritesheet?.name}</div>
          {spritesheet?._creationTime && (
            <div className="ml-auto text-xs h-full text-muted-foreground flex items-center">
              {format(new Date(spritesheet._creationTime), "PPpp")}
            </div>
          )}
        </div>
        <Separator />
        <div className="p-4">
          <ImageDialog src={texture?.url} maxWidth={400} maxHeight={300} />
        </div>
        <div className="flex-1 h-full whitespace-pre-wrap p-4 text-sm flex flex-col">
          <ScrollArea className="h-full w-full flex-1 max-h-[calc(100vh-540px)]">
            <JsonPretty data={spritesheet?.data} />
          </ScrollArea>
        </div>
        <Separator className="mt-auto" />
        <div className="p-2">
        </div>
      </div>
    </div>
  )
}