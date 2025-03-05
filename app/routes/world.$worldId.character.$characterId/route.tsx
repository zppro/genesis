import { format } from "date-fns/format"
import { useLoaderData, useNavigation, Form } from "@remix-run/react";
import { Label } from "~/components/ui/label"
import { type LoaderFunctionArgs } from "@remix-run/node";
import { Separator } from "~/components/ui/separator"
import { getWorldCharacterExtend } from "~/data/convexProxy/character.server"
import { type CharacterId, table } from "@/world/character/schema";
import { GetOneErrorBoundary } from "~/components/error-boundary"
import { parseIsNotFoundRecordError } from "@/error";
import JsonPretty from "~/components/ui/json-pretty";
import { ScrollArea } from "~/components/ui/scroll-area"
import Toolbar from "~/components/toolbars/entity-detail-toolbar";
import { ImageDialog } from "~/components/ui/image-dialog";
import { Badge } from "~/components/ui/badge"
import { LoaderCircle } from "lucide-react"
import { ClientOnly } from "remix-utils/client-only"
import PixiAnimationObject from "~/components/pixi/animation-object";
import { Stage } from '@pixi/react';
import { parsePixiSpritesheet, parsePixiAnmimationAnimationNames, parsePixiAnmimationSourceSize } from "~/zod/spritesheet";
import { TabsList, Tabs, TabsTrigger, TabsContent } from "~/components/ui/tabs"
import { useRedirectToast } from "~/hooks/use-redirectToast";
import ToolItem from "~/components/toolbars/tool-item"
import { Button } from "~/components/ui//button";
import { CloudUpload, Check, TriangleAlert } from "lucide-react"
import { Handle } from "~/lib/routeHandle";
import { breadcrumb } from "~/components/app-breadcrumb";

export const handle: Handle = {
  breadcrumb
};

export async function loader({
  params,
}: LoaderFunctionArgs) {
  const { worldId, characterId } = params;
  const routeUrl = `/world/${worldId}/llm/${characterId}`
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
    const breadcrumbData = { routeName: characterEx.name, routeUrl }
    return { ...breadcrumbData, characterEx }
  }
}

export function ErrorBoundary() {
  return <GetOneErrorBoundary />
}

export default function Index() {
  const { characterEx } = useLoaderData<typeof loader>();
  const state = useRedirectToast("sync")
  const navigation = useNavigation()
  const isSyncing = state === "submitting" && navigation.formMethod === "POST" && navigation.formAction === `/world/${characterEx?.worldId}/character/${characterEx?._id}/sync`;
  const isSynced = characterEx.syncTime && characterEx.modifyTime && characterEx.modifyTime < characterEx.syncTime

  const data = characterEx?.spritesheet?.data
  const pixiSpriteSheet = parsePixiSpritesheet(data)
  const sourceSize = parsePixiAnmimationSourceSize(pixiSpriteSheet)
  const animationNames = parsePixiAnmimationAnimationNames(pixiSpriteSheet)

  return (
    <div className="flex h-full items-start flex-col">
      <Toolbar entityName={table} >
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
          <div className="font-semibold text-lg">{characterEx?.name}<Badge className="ml-2">speed:{characterEx?.speed}</Badge></div>
          {characterEx?._creationTime && (
            <div className="ml-auto text-xs h-full text-muted-foreground flex items-center">
              {format(new Date(characterEx._creationTime), "PPpp")}
            </div>
          )}
        </div>
        <Separator />
        <Tabs defaultValue="ui" className="relative mt-2 mr-auto w-full">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="ui"
              className="relative rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none focus-visible:ring-0 data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none "
            >
              UI
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="relative rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none focus-visible:ring-0 data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none "
            >
              Settings
            </TabsTrigger>
          </TabsList>
          <TabsContent value="ui">
            <ScrollArea className="p-4 h-full w-full max-h-[calc(100vh-260px)]">
              <div className="flex flex-col space-y-2">
                <div>
                  <ClientOnly fallback={<LoaderCircle className="h-4 w-4 loading-icon" />}>
                    {
                      () =>
                        <Stage key={characterEx._id} width={sourceSize.w * animationNames.length} height={sourceSize.h} options={{ background: 0xffffff }} onMount={() => {
                          console.log('stage on mounted')
                        }}>

                          {

                            animationNames.map((aname, idx) =>

                              <PixiAnimationObject
                                animationSpritesheet={pixiSpriteSheet} speed={characterEx.speed}
                                animationName={aname}
                                x={sourceSize.w * idx}
                                y={0}
                                w={sourceSize.w}
                                h={sourceSize.h}
                              />
                            )
                          }

                        </Stage>
                    }
                  </ClientOnly>
                  {/* <ImageDialog src={characterEx?.textureUrl} maxWidth={400} maxHeight={300} /> */}
                </div>
                <div className="whitespace-pre-wrap"><JsonPretty data={characterEx?.spritesheet?.data} className="w-[450px]" /></div>
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="settings">
            <ScrollArea className="p-4 h-full w-full max-h-[calc(100vh-260px)]">
              <div className="flex flex-col space-y-2">
                <h2>Description:</h2>
                <p className="text-gray-400 text-sm italic indent-8 pb-2">{characterEx?.settingsVariant?.desc}</p>
              </div>
              <div className="flex flex-col space-y-2">
                <div className="whitespace-pre-wrap"><JsonPretty data={JSON.stringify(characterEx?.settingsVariant?.settings, null, 2)} className="w-[450px]" /></div>
              </div>
            </ScrollArea>

          </TabsContent>
        </Tabs>

        <Separator className="mt-auto" />
        <div className="p-2">
        </div>
      </div>
    </div>
  )
}