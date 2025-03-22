import { format } from "date-fns/format"
import { useLoaderData, useNavigation } from "@remix-run/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { Separator } from "~/components/ui/separator"
import { getWorldSpritesheet } from "~/data/convexProxy/spritesheet.server"
import { type SpritesheetId, table } from "@/world/spritesheets";
import { GetOneErrorBoundary } from "~/components/error-boundary"
import { parseIsNotFoundRecordError } from "@/error";
import JsonPretty from "~/components/ui/json-pretty";
import { ScrollArea } from "~/components/ui/scroll-area"
import Toolbar from "~/components/toolbars/entity-detail-toolbar";
import ToolItem from "~/components/toolbars/tool-item"
import { ImageDialog } from "~/components/ui/image-dialog";
import { getWorldTexture } from "~/data/convexProxy/texture.server"
import { type TextureId } from "@/world/textures";
import { Badge } from "~/components/ui/badge"
import { Form } from "@remix-run/react";
import { Button } from "~/components/ui//button";
import { CloudUpload, Check, TriangleAlert } from "lucide-react"
import { useRedirectToast, useRedirectToastOld } from "~/hooks/use-redirectToast";

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
  const state = useRedirectToastOld("sync")
  const navigation = useNavigation()
  const isSyncing = state === "submitting" && navigation.formMethod === "POST" && navigation.formAction === `/world/${spritesheet?.worldId}/spritesheet/${spritesheet?._id}/sync`;
  const isSynced = spritesheet.syncTime && spritesheet.modifyTime && spritesheet.modifyTime < spritesheet.syncTime
  return (
    <div className="flex h-full items-start flex-col">
      <Toolbar entityName={table}>
        <ToolItem itemTip="sync to the world">
          <Form method="post" action="sync">
            <Button variant="ghost" size="default" className="border" type="submit" disabled={isSyncing} >
              <CloudUpload className="h-4 w-4" />
              <span>{isSyncing ? "Syncing..." : "Sync"}</span>
              {isSynced ? <Check className="text-green-500" /> : <TriangleAlert className="text-yellow-500" />}
            </Button>
          </Form>
        </ToolItem>
      </Toolbar>
      <Separator />
      <div className="w-full flex flex-1 flex-col">
        <div className="w-full flex items-start flex-row p-4 ">
          <div className="font-semibold text-lg">{spritesheet?.name}<Badge className="ml-2">{spritesheet?.type}</Badge></div>
          {spritesheet?._creationTime && (
            <div className="ml-auto text-xs h-full text-muted-foreground flex items-center">
              {format(new Date(spritesheet._creationTime), "PPpp")}
            </div>
          )}
        </div>
        <Separator />
        <ScrollArea className="p-4 h-full w-full max-h-[calc(100vh-200px)]">
          <div className="flex flex-col space-y-2">
            <div><ImageDialog src={texture?.url} maxWidth={400} maxHeight={300} /></div>
            <div className="whitespace-pre-wrap"><JsonPretty data={spritesheet?.data} className="w-[520px]" /></div>
          </div>
        </ScrollArea>
        {/* <div className="p-4">
          <ImageDialog src={texture?.url} maxWidth={400} maxHeight={300} />
        </div> */}
        {/* <div className="flex-1 h-full whitespace-pre-wrap p-4 text-sm flex flex-col">
          <ScrollArea className="h-full w-full flex-1 max-h-[calc(100vh-300px)]">
            <JsonPretty data={spritesheet?.data} className="w-[520px]" />
          </ScrollArea>
        </div> */}
        <Separator className="mt-auto" />
        <div className="p-2">
        </div>
      </div>
    </div>
  )
}