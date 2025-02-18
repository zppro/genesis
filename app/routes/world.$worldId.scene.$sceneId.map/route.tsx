import { useEffect, useState, useRef } from "react";
import { useNavigation, useLoaderData, useActionData, useFetcher, Outlet, Link, } from "@remix-run/react";
import { useRouteLoaderData } from "@remix-run/react";
import type { loader as sceneLoader } from "~/routes/world.$worldId.scene.$sceneId/route";
import { useSceneMap } from "~/hooks/use-sceneMap"
import { ClientOnly } from "remix-utils/client-only"
import { Stage } from '@pixi/react';
import Tilemap from "~/components/pixi/tilemap.client";
import { LoaderCircle } from "lucide-react"
import { Separator } from "~/components/ui/separator"
import { Button } from "~/components/ui/button"
import SetBlockLayersForm, { mergeNamePrefixsAsArray } from "~/routes/world.$worldId.scene.$sceneId.map/form"
import { ListCheck, SquareDashed, Eraser, Stamp } from "lucide-react";
import { SheetTrigger } from "~/components/ui/sheet"
import { type LoaderFunctionArgs, LinksFunction, ActionFunctionArgs } from "@remix-run/node";
import { ServerErrors, ClientErrors } from "~/components/convex/type";
import { parseFormError } from "~/lib/error.server"
import { convertFormDataToObject } from "~/lib/form";
import { SceneId, SetBlockerLayersArgs } from "@/world/scenes";
import { setSceneBlockerLayers } from "~/data/convexProxy/scene.server";
import { Handle } from "~/lib/routeHandle";
import { breadcrumb } from "~/components/app-breadcrumb";
import type { TilemapMode } from "~/components/pixi/tilemap.client";
import { CustomTileLayer } from "@/shared/tilemap";
import { api } from "@/_generated/api";
import { useMutation } from "convex/react";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group"
import { Switch } from "~/components/ui/switch"
import { Label } from "~/components/ui/label";
import { opValues as obstacleOpValues, renderOpIcon as obstacleRenderOpIcon, OpValue } from "~/components/customLayers/obstacle";


export const handle: Handle = {
  breadcrumb
};

export async function action({
  request,
  params,
}: ActionFunctionArgs) {
  const { worldId, sceneId } = params;
  let serverErrors: ServerErrors = {}
  const formData = await request.formData();
  const _formData = convertFormDataToObject(formData, { mergeNamePrefixsAsArray });
  const formPayload = { blockLayers: [], ..._formData, id: sceneId as SceneId }
  console.log('formPayload=>', formPayload)
  
  // payload z schema validation
  try {
    await setSceneBlockerLayers(formPayload as unknown as SetBlockerLayersArgs)
    return {}
  } catch (error) {
    console.error("err=>", error)
    // {field1: errorMessage, ...}
    serverErrors = parseFormError(error, [])
  }

  return { serverErrors }
}

export async function loader({
  params,
  request,
}: LoaderFunctionArgs) {
  const breadcrumbData = { routeName: "map", routeUrl: "#" }
  return { ...breadcrumbData }
}

export default function TilemapTab() {
  // const [app, setApp] = useState<PIXI.Application<PIXI.ICanvas>>();
  // const [stageMounted, setStageMounted] = useState(false);
  const { sceneEx } = useRouteLoaderData<typeof sceneLoader>("routes/world.$worldId.scene.$sceneId")!;
  const actionData = useActionData<typeof action>();
  const [errors, setErrors] = useState(actionData?.serverErrors)
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mode, setMode] = useState<TilemapMode>("normal");
  const [opValue, setOpValue] = useState<OpValue | "">("");
  const { map, tileLayers, customLayers, setCustomLayers } = useSceneMap(sceneEx);
  const setSceneBlockerLayersFn = useMutation(api.world.scenes.setCustomLayers);
  const navigation = useNavigation();
  const isSubmitting = (navigation.formMethod === "POST" || navigation.formMethod === "PUT")
    && navigation.formAction === `/world/${sceneEx.worldId}/scene/${sceneEx._id}/map`;

  const [screenWidth, screenHeight] = [400, 400]

  useEffect(() => {
    if (actionData) {
      if ("serverErrors" in actionData) {
        setErrors(actionData.serverErrors)
      } else {
        setSheetOpen(false)
      }
    }
  }, [actionData])

  function onCustomLayersChanged(v: CustomTileLayer[]) {
    // console.log('onCustomLayersChanged=>', v);
    setSceneBlockerLayersFn({
      id: sceneEx._id,
      customLayers: v,
    })
  }

  return (
    <div className="border flex-1 flex flex-col h-full p-2">
      <div className="flex items-center gap-2 p-2">
        <div className="flex items-center space-x-2">
          <Switch id="obstacleMode" defaultChecked={mode === "obstacle"} onCheckedChange={(v: boolean) => {
            setMode(v ? 'obstacle' : 'normal');
          }} />
          <Label htmlFor="obstacleMode">Obstacle mode</Label>
        </div>
        <SetBlockLayersForm
          errors={errors}
          doc={sceneEx}
          checkItems={tileLayers}
          isSubmitting={isSubmitting}
          open={sheetOpen}
          setOpen={setSheetOpen}
        >
          <SheetTrigger asChild>
            <Button variant="outline" ><ListCheck className="size-4" />Set block layers
              <div className="flex px-2 py-1 h-5 items-center space-x-2 text-sm text-gray-400">
                {
                  sceneEx.blockLayers?.map((layer, idx) => (
                    <>
                      {idx > 0 ? <Separator orientation="vertical" /> : null}
                      <div key={layer}>{layer}</div>
                    </>
                  ))
                }
              </div>
            </Button>
          </SheetTrigger>
        </SetBlockLayersForm>
        {/* <Button variant="outline" disabled={!stageMounted} className={mode === "obstacle" ? "bg-gray-200 hover:bg-gray-200" : ""} onClick={() => {
          setMode(mode === 'obstacle' ? 'normal' : 'obstacle');
          // app?.renderer.render(app.stage)
        }}  ><SquareDashed className="size-4" />Set custome block layer</Button> */}

      </div>
      <div className="pt-2 flex">
        <div className="w-10">
          <ToggleGroup
            type="single"
            className="flex-col"
            variant="outline"
            disabled={mode !== "obstacle"}
            onValueChange={(v: OpValue | "") => {
              console.log("toggle group value=>", v)
              setOpValue(v);
            }}
          >
            {
              obstacleOpValues.map(v =>
                <ToggleGroupItem value={v} aria-label={`Toggle ${v}`}>
                  {obstacleRenderOpIcon(v)}
                </ToggleGroupItem>
              )
            }
          </ToggleGroup>
        </div>
        <div className="place-content-center grid">
          <ClientOnly fallback={<LoaderCircle className="h-4 w-4 loading-icon" />}>
            {() =>
              <Stage key={sceneEx._id} width={screenWidth} height={screenHeight} options={{ background: 0xffffff }}
                // raf={false}
                // renderOnComponentChange={false}
                onMount={(v) => {
                  console.log('stage on mounted')
                  // setApp(v)
                  // setStageMounted(true)
                }}>
                {
                  map && <Tilemap
                    key={mode}
                    width={screenWidth}
                    height={screenHeight}
                    mode={mode} map={map}
                    tilemapAnimations={[]}
                    customLayers={customLayers}
                    customLayerOp={opValue}
                    onCustomLayersChanged={onCustomLayersChanged}
                  />
                }
              </Stage>
            }
          </ClientOnly>
        </div>
      </div>
    </div>

  )
}
