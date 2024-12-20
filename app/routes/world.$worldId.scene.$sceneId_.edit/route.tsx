import { useNavigation } from "@remix-run/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { GetOneErrorBoundary } from "~/components/error-boundary"
import { parseIsNotFoundRecordError } from "@/error";
import { useLoaderData, useActionData, redirect } from "@remix-run/react";
import type { ActionFunctionArgs, LinksFunction } from "@remix-run/node";
import SceneForm, { numberKeys } from "~/routes/world.$worldId.scene/form"
import { z } from "zod";
import { getWorldScene, updateWorldScene } from "~/data/convexProxy/scene.server"
import { type SceneId, type UpdateArgs, table } from "@/world/scenes";
import { type ResouceTable } from "@/world/resources";
import formcssHref from "~/form.css?url";
import Toolbar from "~/components/toolbars/entity-save-toolbar";
import { Separator } from "~/components/ui/separator"
import { parseFormError } from "~/lib/error.server"
import { convertFormDataToObject } from "~/lib/form";
import { ServerErrors, ClientErrors } from "~/components/convex/type";
import { listWorldResourcsByType } from "~/data/convexProxy/resource.server"
import { type WorldId } from "@/worlds";
import { type ConvexComboxItem } from "~/components/ui/combox"
import { useState, useEffect } from "react";
import { FileJson } from "lucide-react"

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: formcssHref },
];

const updateSceneFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  desc: z.string(),
  // a tile's dimension
  tiledim: z.number().int().gt(0),
  // x axis tiles number in map
  screenxtiles: z.number().int().gt(0),
  // y axis tiles number in map
  screenytiles: z.number().int().gt(0),
  // tileset png width
  tilesetpxw: z.number().int().gt(0),
  // tileset png height
  tilesetpxh: z.number().int().gt(0),
  // reource type = 'tileset'
  tilesetId: z.string().min(1, { message: "tileset is required" }),
  // reource type = 'tilemap'
  tilemapId: z.string().min(1, { message: "tilemap is required" }),
});

export async function action({
  request,
  params,
}: ActionFunctionArgs) {
  const { worldId, sceneId } = params;

  let serverErrors: ServerErrors = {}

  const formData = await request.formData();
  const _formData = convertFormDataToObject(formData, { numberKeys });
  const formPayload = { ..._formData, id: sceneId as SceneId }

  // payload z schema validation
  const result = updateSceneFormSchema.safeParse(formPayload);
  if (result.success) {
    try {
      await updateWorldScene(formPayload as UpdateArgs)
      return redirect(`/world/${worldId}/scene/${sceneId}`)
    } catch (error) {
      // {field1: errorMessage, ...}
      const fields = Object.keys(updateSceneFormSchema.keyof().Values)
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
  let scene = null
  try {
    scene = await getWorldScene(sceneId as SceneId)
  } catch (error) {
    let isNotFoundError = parseIsNotFoundRecordError(error)
    if (isNotFoundError) {
      throw new Response(null, {
        status: 404,
        statusText: "Not Found",
      });
    }
    throw error
  }
  finally {
    if (scene === null) {
      throw new Response(null, {
        status: 404,
        statusText: "Not Found",
      });
    }
    const tilesets = await listWorldResourcsByType(worldId as WorldId, "tileset")
    const tilemaps = await listWorldResourcsByType(worldId as WorldId, "tilemap")
    return { scene, tilesets, tilemaps }
  }
}

export function ErrorBoundary() {
  return <GetOneErrorBoundary />
}


export default function EditScene() {
  const { scene, tilesets, tilemaps } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const tilesetItems = tilesets.map<ConvexComboxItem<ResouceTable>>(t => ({
    key: t._id, text: t.name, icon: t.url
  }))
  const tilemapItems = tilemaps.map<ConvexComboxItem<ResouceTable>>(t => ({
    key: t._id, text: t.name, icon: FileJson
  }))
  const [errors, setErrors] = useState(actionData?.serverErrors)

  useEffect(() => {
    if (actionData && "serverErrors" in actionData) {
      setErrors(actionData.serverErrors)
    }
  }, [actionData])

  function onClientErrors(clientErrors: ClientErrors) {
    // { ...actionData?.serverErrors, ...clientErrors }
    console.log('onClientErrors', clientErrors)
    setErrors(clientErrors)
  }
  const navigation = useNavigation();
  const isSubmitting = navigation.formMethod === "POST" && navigation.formAction === `/world/${scene?.worldId}/scene/${scene?._id}/edit`;
  return (
    <div className="h-full">
      <SceneForm
        errors={errors}
        onClientErrors={onClientErrors}
        doc={scene!}
        schema={updateSceneFormSchema}
        tilesetItems={tilesetItems}
        tilemapItems={tilemapItems}
      >
        <Toolbar isSubmitting={isSubmitting} entityName={table} />
        <Separator />
      </SceneForm>
    </div>
  )
}