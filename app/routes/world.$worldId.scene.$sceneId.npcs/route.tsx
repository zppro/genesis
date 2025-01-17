
import { useNavigation, useLoaderData, useActionData, useFetcher, Outlet, Link, } from "@remix-run/react";
import { type LoaderFunctionArgs, LinksFunction, ActionFunctionArgs } from "@remix-run/node";
import { LoaderCircle, Search, Plus, Layers } from "lucide-react"
import { useRouteLoaderData } from "@remix-run/react";
import type { loader as sceneLoader } from "~/routes/world.$worldId.scene.$sceneId/route";
import List from "./list"
import Tilemap, { TilemapAnimation } from "~/components/pixi/tilemap.client";
import { Stage } from '@pixi/react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "~/components/ui/resizable"
import { WorldId } from "@/worlds";
import { SceneId } from "@/world/scenes";
import { ClientOnly } from "remix-utils/client-only"
import { useEffect, useState, useRef } from "react";
import { PixiTilemapConverted, parseLayerData, convertLayerData, TileLayer } from "@/shared/tilemap"
import { SheetTrigger } from "~/components/ui/sheet"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { type ConvexComboxItem } from "~/components/ui/combox"
import SceneNPCForm from "~/routes/world.$worldId.scene.$sceneId.npcs/form"
import formcssHref from "~/form.css?url";
import { z } from "zod";
import { ServerErrors, ClientErrors } from "~/components/convex/type";
import { parseFormError } from "~/lib/error.server"
import { convertFormDataToObject } from "~/lib/form";
import { numberKeys, decimalKeys } from "~/routes/world.$worldId.scene.$sceneId.npcs/form"
import { createSceneNPC, updateSceneNPC, listSceneNPCExtends } from "~/data/convexProxy/sceneNPC.server"
import { type InsertArgs, type UpdateArgs, SceneNPCDoc, SceneNPCId } from "@/world/sceneNPCs";
import { listWorldCharacterExtends } from "~/data/convexProxy/character.server";
import { CharacterTable } from "@/world/characters";
import PixiAnimationObject from "~/components/pixi/animation-object";
import { PixiSpritesheet } from "@/shared/spritesheet";
import { Size } from "@/shared/frame";
import { parsePixiSpritesheet, parsePixiAnmimationAnimationNames, parsePixiAnmimationSourceSize } from "~/zod/spritesheet";
import { Handle } from "~/lib/routeHandle";
import { breadcrumb } from "~/components/app-breadcrumb";

export const handle: Handle = {
  breadcrumb
};

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: formcssHref },
];

const saveSchema = {
  name: z.string().min(1, { message: "Name is required" }),
  // animation x axis in map
  x: z.number().int().gt(0),
  // animation y axis in map
  y: z.number().int().gt(0),
  // animation width
  w: z.number().int().gt(0),
  // animation height
  h: z.number().int().gt(0),
  // character animation play speed
  speed: z.number().gt(0),
  // character move step
  move: z.number().int().gt(0),
  characterId: z.string().min(1, { message: "character is required" }),
}
const createSceneNPCFormSchema = z.object({
  sceneId: z.string(),
  ...saveSchema,
});

const updateSceneNPCFormSchema = z.object({
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
  const _formData = convertFormDataToObject(formData, { numberKeys, decimalKeys });
  const formPayload = isUpdate ? { ..._formData } : { ..._formData, sceneId, id: undefined }
  console.log('formPayload=>', formPayload)
  // payload z schema validation
  const validateSchema = isUpdate ? updateSceneNPCFormSchema : createSceneNPCFormSchema;
  const result = validateSchema.safeParse(formPayload);
  if (result.success) {
    try {
      if (isUpdate) {
        await updateSceneNPC(formPayload as unknown as UpdateArgs)
      } else {
        const newSceneNPCId = await createSceneNPC(formPayload as unknown as InsertArgs)
        // const newSceneId = ''
        console.log('newSceneNPCId=>', newSceneNPCId)
      }
      return {}
    } catch (error) {
      // {field1: errorMessage, ...}
      const fields = Object.keys(createSceneNPCFormSchema.keyof().Values)
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
  console.log('npc load')
  const sceneNPCExs = await listSceneNPCExtends(sceneId as SceneId)
  const characterExs = await listWorldCharacterExtends(worldId as WorldId);
  const breadcrumbData = { routeName: "npcs", routeUrl: "#" }
  return { ...breadcrumbData, worldId: worldId as WorldId, sceneId: sceneId as SceneId, sceneNPCExs, characterExs }
}

export default function NPCsTab() {
  const { sceneEx } = useRouteLoaderData<typeof sceneLoader>("routes/world.$worldId.scene.$sceneId")!;
  const { worldId, sceneId, sceneNPCExs, characterExs } = useLoaderData<typeof loader>();

  const [map, setMap] = useState<PixiTilemapConverted>()
  const actionData = useActionData<typeof action>();
  const [errors, setErrors] = useState(actionData?.serverErrors)
  const [sheetOpen, setSheetOpen] = useState(false);
  const [currentSceneNPC, setCurrentSceneNPC] = useState<SceneNPCDoc>();
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
      tilelayers.forEach((layer: any) => {
        console.log(layer)
      })
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

  function onEditSceneNPC(id: SceneNPCId) {
    console.log('onEditSceneAnimation id=>', id)
    const sceneNPC = sceneNPCExs.find(item => item._id === id)
    console.log('onEditSceneNPC:', sceneNPC)
    setCurrentSceneNPC(sceneNPC)
    buttonRef.current!.click()
  }
  const navigation = useNavigation();
  const isSubmitting = (navigation.formMethod === "POST" || navigation.formMethod === "PUT")
    && navigation.formAction === `/world/${worldId}/scene/${sceneId}/npcs`;

  const tilemapAnimations = sceneNPCExs.map<TilemapAnimation>(sa => ({
    name: sa.name,
    x: sa.x,
    y: sa.y,
    w: sa.w,
    h: sa.h,
    speed: sa.speed,
    spritesheet: parsePixiSpritesheet(sa.characterEx?.spritesheet?.data),
    type: "npc",
    data: {
      move: sa.move,
      tileDim: map ? map.tiledim : 0,
      xTiles: map ? map.screenxtiles : 0,
      yTiles: map ? map.screenytiles : 0,
    }
  }
  ))

  const pixiSpriteSheets: Record<string, { pixiSpriteSheet: PixiSpritesheet, sourceSize: Size, animationNames: string[] }> = {}
  const characterItems = characterExs.map<ConvexComboxItem<CharacterTable>>(t => {
    let v = pixiSpriteSheets[t.spritesheetId]
    if (!v) {
      const data = t.spritesheet?.data
      const pixiSpriteSheet = parsePixiSpritesheet(data)
      const sourceSize = parsePixiAnmimationSourceSize(pixiSpriteSheet)
      const animationNames = parsePixiAnmimationAnimationNames(pixiSpriteSheet)
      v = { pixiSpriteSheet, sourceSize, animationNames }
      pixiSpriteSheets[t.spritesheetId] = v
    }
    const elem = <ClientOnly fallback={<LoaderCircle className="h-4 w-4 loading-icon" />}>
      {
        () =>
          <Stage key={t._id} width={v.sourceSize.w * v.animationNames.length} height={v.sourceSize.h} options={{ background: 0xffffff }} onMount={() => {
            console.log(`stage(${t.name}) on mounted`)
          }}>

            {

              v.animationNames.map((aname, idx) =>

                <PixiAnimationObject
                  animationSpritesheet={v.pixiSpriteSheet} speed={t.speed}
                  animationName={aname}
                  x={v.sourceSize.w * idx}
                  y={0}
                  w={v.sourceSize.w}
                  h={v.sourceSize.h}
                />
              )
            }

          </Stage>
      }
    </ClientOnly>

    return { key: t._id, text: t.name, icon: elem, data: t }
  })


  return (
    <div className="border flex-1 flex flex-col">
      <ResizablePanelGroup
        direction="horizontal"
        className="h-full items-stretch"
      >
        <ResizablePanel defaultSize={25} minSize={25}>
          <List sceneNPCExs={sceneNPCExs} onEditSceneNPC={onEditSceneNPC}>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <form>
                <Input placeholder="Search" className="pl-8" />
              </form>
              <SceneNPCForm
                errors={errors}
                doc={currentSceneNPC}
                onClientErrors={onClientErrors}
                schema={createSceneNPCFormSchema}
                characterItems={characterItems}
                isSubmitting={isSubmitting}
                open={sheetOpen}
                setOpen={setSheetOpen}
              >
                <SheetTrigger asChild>
                  <Button ref={buttonRef} className="hidden">edit trigger click</Button>
                </SheetTrigger>
                <SheetTrigger asChild>
                  <Button onClick={() => {
                    setCurrentSceneNPC(undefined)
                  }} variant="link" size="icon" className="absolute  right-2 top-2.5 h-4 w-4"><Plus className="size-4" /></Button>
                </SheetTrigger>
              </SceneNPCForm>
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