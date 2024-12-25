
import { useNavigation, useLoaderData, useActionData, useFetcher, Outlet, Link, } from "@remix-run/react";
import { type LoaderFunctionArgs, LinksFunction, ActionFunctionArgs } from "@remix-run/node";
import { LoaderCircle } from "lucide-react"
import { useRouteLoaderData } from "@remix-run/react";
import type { loader as sceneLoader } from "~/routes/world.$worldId.scene.$sceneId/route";
import List from "./list"
import Tilemap, { TilemapAnimation } from "~/components/pixi/tilemap.client";
import { Stage } from '@pixi/react';
import { listSceneAnimationExtends } from "~/data/convexProxy/sceneAnimation.server"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable"
import { WorldId } from "@/worlds";
import { SceneId } from "@/world/scenes";
import { ClientOnly } from "remix-utils/client-only"
import { useEffect, useState, useRef } from "react";
import { PixiTilemapConverted, parseLayerData, convertLayerData, TileLayer } from "@/shared/tilemap"

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet"
import { Label } from "~/components/ui/label"
import { Input } from "~/components/ui/input"
import { Search, Plus } from "lucide-react"
import { Button } from "~/components/ui/button"
import { type ConvexComboxItem } from "~/components/ui/combox"
import SceneAnimationForm from "~/routes/world.$worldId.scene.$sceneId.animations/form"
import formcssHref from "~/form.css?url";
import { z } from "zod";
import { ServerErrors, ClientErrors } from "~/components/convex/type";
import { parseFormError } from "~/lib/error.server"
import { convertFormDataToObject } from "~/lib/form";
import { numberKeys } from "~/routes/world.$worldId.scene.$sceneId.animations/form"
import { createSceneAnimation, updateSceneAnimation } from "~/data/convexProxy/sceneAnimation.server"
import { type InsertArgs, type UpdateArgs, SceneAnimationDoc, SceneAnimationId, table } from "@/world/sceneAnimations";
import { listWorldObjectExtendsByType } from "~/data/convexProxy/object.server";
import { ObjectTable } from "@/world/objects";
import { parsePixiSpritesheet, parsePixiAnmimationSourceSize } from "~/lib/spritesheet";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: formcssHref },
];

const saveSchema = {
  name: z.string().min(1, { message: "Name is required" }),
  // x axis tiles number in map
  x: z.number().int().gt(0),
  // y axis tiles number in map
  y: z.number().int().gt(0),
  // tileset png width
  w: z.number().int().gt(0),
  // tileset png height
  h: z.number().int().gt(0),
  objectId: z.string().min(1, { message: "object is required" }),
}
const createSceneAnimationFormSchema = z.object({
  sceneId: z.string(),
  ...saveSchema,
});

const updateSceneAnimationFormSchema = z.object({
  ...saveSchema,
});



export async function action({
  request,
  params,
}: ActionFunctionArgs) {
  console.log('==action==')
  const { worldId, sceneId } = params;
  console.log('request.method=>', request.method)
  const isUpdate = request.method.toUpperCase() === "PUT"
  let serverErrors: ServerErrors = {}

  const formData = await request.formData();
  const _formData = convertFormDataToObject(formData, { numberKeys });
  const formPayload = isUpdate ? { ..._formData } : { ..._formData, sceneId, id: undefined }
  console.log('formPayload=>', formPayload)
  // payload z schema validation
  const validateSchema = isUpdate ? updateSceneAnimationFormSchema : createSceneAnimationFormSchema;
  const result = validateSchema.safeParse(formPayload);
  if (result.success) {
    try {
      if (isUpdate) {
        await updateSceneAnimation(formPayload as unknown as UpdateArgs)
      } else {
        const newSceneAnimationId = await createSceneAnimation(formPayload as unknown as InsertArgs)
        // const newSceneId = ''
        console.log('newSceneAnimationId=>', newSceneAnimationId)
      }
      return {}
    } catch (error) {
      // {field1: errorMessage, ...}
      const fields = Object.keys(createSceneAnimationFormSchema.keyof().Values)
      serverErrors = parseFormError(error, fields)
    }
  } else {
    // Handle validation errors
    serverErrors = { ...result.error.formErrors.fieldErrors }
  }

  return { serverErrors }
}

export async function loader({
  params,
}: LoaderFunctionArgs) {
  const { worldId, sceneId } = params;
  console.log('animation load')
  const sceneAnimationExs = await listSceneAnimationExtends(sceneId as SceneId)
  const objectExs = await listWorldObjectExtendsByType(worldId as WorldId, "animation");
  return { worldId: worldId as WorldId, sceneId: sceneId as SceneId, sceneAnimationExs, objectExs }
}

export default function AnimationsTab() {
  const { sceneEx } = useRouteLoaderData<typeof sceneLoader>("routes/world.$worldId.scene.$sceneId")!;
  const { worldId, sceneId, sceneAnimationExs, objectExs } = useLoaderData<typeof loader>();
  const objectItems = objectExs.map<ConvexComboxItem<ObjectTable>>(t => ({
    key: t._id, text: t.name, icon: t.texture.url, data: t.spritesheet
  }))
  const [map, setMap] = useState<PixiTilemapConverted>()
  const actionData = useActionData<typeof action>();
  const [errors, setErrors] = useState(actionData?.serverErrors)
  const [sheetOpen, setSheetOpen] = useState(false);
  const [currentSceneAnimation, setCurrentSceneAnimation] = useState<SceneAnimationDoc>();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const tilesetUrl = sceneEx.tileset.url!;
    const tilemapUrl = sceneEx.tilemap.url!;
    (async () => {


      const response = await fetch(tilemapUrl);
      const parsed = await response.json();
      // console.log("parsed typeof:", parsed)

      const bgtiles: TileLayer[] = []
      const objmap: TileLayer[] = []
      const tilelayers = parsed.layers.filter((layer: any) => layer.type === 'tilelayer');
      const [head, ...[_, ...tail]] = tilelayers
      const objmapLayer = tail[tail.length - 1];

      bgtiles.push(parseLayerData(head.data, head.width, head.height))
      objmap.push(parseLayerData(objmapLayer.data, objmapLayer.width, objmapLayer.height))
      // parsed.layers.forEach((layer: any) => {
      //   console.log('layer=>', layer)
      //   if (layer.type === "tilelayer") {
      //     bgtiles.push(parseLayerData(layer.data, layer.width, layer.height))
      //   } else if (layer.type === "objectgroup") {

      //   }
      // })

      // console.log('bgtiles[0]:', bgtiles[0].length)
      // console.log('bgtiles[0][0]:', bgtiles[0][0].length)
      // console.log('objmap.length:', objmap.length)


      const _map: PixiTilemapConverted = {
        tiledim: sceneEx.tiledim,
        screenxtiles: sceneEx.screenxtiles,
        screenytiles: sceneEx.screenytiles,
        tilesetpxw: sceneEx.tilesetpxw,
        tilesetpxh: sceneEx.tilesetpxh,
        tilesetpath: tilesetUrl,
        bgtiles: bgtiles,
        objmap: objmap,
        animatedsprites: [],
        mapwidth: sceneEx.screenxtiles,
        mapheight: sceneEx.screenytiles,
      }
      // console.log('_map=>', _map)
      setMap(_map)

    })();
  }, [sceneEx])

  useEffect(() => {
    if (actionData) {
      if ("serverErrors" in actionData) {
        setErrors(actionData.serverErrors)
      } else {
        setSheetOpen(false)
      }
    }
  }, [actionData])

  function onClientErrors(clientErrors: ClientErrors) {
    // { ...actionData?.serverErrors, ...clientErrors }
    setErrors(clientErrors)
  }

  function onEditSceneAnimation(id: SceneAnimationId) {
    console.log('onEditSceneAnimation id=>', id)
    const sceneAnimation = sceneAnimationExs.find(item => item._id === id)
    console.log('onEditSceneAnimation:', sceneAnimation)
    setCurrentSceneAnimation(sceneAnimation)
    buttonRef.current!.click()
  }
  const navigation = useNavigation();
  const isSubmitting = (navigation.formMethod === "POST" || navigation.formMethod === "PUT")
    && navigation.formAction === `/world/${worldId}/scene/${sceneId}/animations`;

  const tilemapAnimations = sceneAnimationExs.map<TilemapAnimation>(sa =>
  ({
    x: sa.x,
    y: sa.y,
    w: sa.w,
    h: sa.h,
    speed: 0.1,
    spritesheet: parsePixiSpritesheet(sa.objectEx?.spritesheet?.data)
  })
  )


  return (
    <div className="border flex-1 flex flex-col">
      <ResizablePanelGroup
        direction="horizontal"
        className="h-full items-stretch"
      >
        <ResizablePanel defaultSize={25} minSize={25}>
          <List sceneAnimationExs={sceneAnimationExs} onEditSceneAnimation={onEditSceneAnimation}>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <form>
                <Input placeholder="Search" className="pl-8" />
              </form>
              <SceneAnimationForm
                errors={errors}
                doc={currentSceneAnimation}
                onClientErrors={onClientErrors}
                schema={createSceneAnimationFormSchema}
                objectItems={objectItems}
                isSubmitting={isSubmitting}
                open={sheetOpen}
                setOpen={setSheetOpen}
              >
                <SheetTrigger asChild>
                  <Button ref={buttonRef} className="hidden">edit trigger click</Button>
                </SheetTrigger>
                <SheetTrigger asChild>
                  <Button onClick={() => {
                    setCurrentSceneAnimation(undefined)
                  }} variant="link" size="icon" className="absolute  right-2 top-2.5 h-4 w-4"><Plus className="size-4" /></Button>
                </SheetTrigger>
              </SceneAnimationForm>
            </div>
          </List>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={75}>
          <div className="h-full p-2 grid place-content-center">
            <ClientOnly fallback={<LoaderCircle className="h-4 w-4 loading-icon" />}>
              {() =>
                <Stage key={sceneEx._id} width={400} height={400} options={{ background: 0xffffff }} onMount={() => {
                  console.log('stage on mounted')
                }}>
                  {
                    map && <Tilemap width={400} height={400} map={map} tilemapAnimations={tilemapAnimations} />
                  }

                </Stage>
              }
            </ClientOnly>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}