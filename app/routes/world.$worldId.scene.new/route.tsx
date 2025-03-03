import { useNavigation, useLoaderData, useActionData, redirect } from "@remix-run/react";
import type { LoaderFunctionArgs, ActionFunctionArgs, LinksFunction } from "@remix-run/node";
import SceneForm, { numberKeys } from "~/routes/world.$worldId.scene/form"
import { z } from "zod";
import { createWorldScene } from "~/data/convexProxy/scene.server"
import { type InsertArgs, table } from "@/world/scenes";
import { type ResouceTable } from "@/world/resources";
import formcssHref from "~/form.css?url";
import Toolbar from "~/components/toolbars/entity-save-toolbar";
import { Separator } from "~/components/ui/separator"
import { parseFormError } from "~/lib/error.server"
import { ServerErrors, ClientErrors } from "~/components/convex/type";
import { listWorldResourcsByType } from "~/data/convexProxy/resource.server"
import { type WorldId } from "@/worlds";
import { type ConvexComboxItem } from "~/components/ui/combox"
import { useState, useEffect, createElement } from "react";
import { convertFormDataToObject } from "~/lib/form";
import { FileJson } from "lucide-react"

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: formcssHref },
];
const createSceneFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  desc: z.string(),
  worldId: z.string(),
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
  const { worldId } = params;

  let serverErrors: ServerErrors = {}

  const formData = await request.formData();
  const _formData = convertFormDataToObject(formData, { numberKeys });
  const formPayload = { ..._formData, worldId }

  // payload z schema validation
  const result = createSceneFormSchema.safeParse(formPayload);
  if (result.success) {
    try {
      const newSceneId = await createWorldScene(formPayload as InsertArgs)
      // const newSceneId = ''
      return redirect(`/world/${worldId}/scene/${newSceneId}`)
    } catch (error) {
      // {field1: errorMessage, ...}
      const fields = Object.keys(createSceneFormSchema.keyof().Values)
      serverErrors = parseFormError(error, fields)
    }
  } else {
    // Handle validation errors
    serverErrors = { ...result.error.formErrors.fieldErrors }
  }

  return { serverErrors }
}

export async function loader({ params }: LoaderFunctionArgs) {
  const { worldId } = params;
  if (!worldId) {
    throw new Error("invalid params!");
  }

  const tilesets = await listWorldResourcsByType(worldId as WorldId, "tileset")
  const tilemaps = await listWorldResourcsByType(worldId as WorldId, "tilemap")
  return { worldId, tilesets, tilemaps }
}


export default function NewScene() {
  const { worldId, tilesets, tilemaps } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const tilesetItems = tilesets.map<ConvexComboxItem<ResouceTable>>(t => ({
    key: t._id, text: t.name, icon: t.url
  }))
  const tilemapItems = tilemaps.map<ConvexComboxItem<ResouceTable>>(t => ({
    key: t._id, text: t.name, icon: createElement(FileJson)
  }))
  const [errors, setErrors] = useState(actionData?.serverErrors)

  useEffect(() => {
    if (actionData && "serverErrors" in actionData) {
      setErrors(actionData.serverErrors)
    }
  }, [actionData])

  const navigation = useNavigation();
  const isSubmitting = navigation.formMethod === "POST" && navigation.formAction === `/world/${worldId}/scene/new`;

  function onClientErrors(clientErrors: ClientErrors) {
    // { ...actionData?.serverErrors, ...clientErrors }
    setErrors(clientErrors)
  }

  return (
    <div className="h-full">
      <SceneForm
        errors={errors}
        onClientErrors={onClientErrors}
        schema={createSceneFormSchema}
        tilesetItems={tilesetItems}
        tilemapItems={tilemapItems}
      >
        <Toolbar isSubmitting={isSubmitting} entityName={table} />
        <Separator />
      </SceneForm>
    </div>
  )
}