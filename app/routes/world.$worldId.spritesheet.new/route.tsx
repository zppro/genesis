import { useNavigation, useLoaderData, useActionData, redirect } from "@remix-run/react";
import type { LoaderFunctionArgs, ActionFunctionArgs, LinksFunction } from "@remix-run/node";
import SpritesheetForm from "~/routes/world.$worldId.spritesheet/form"
import { z } from "zod";
import { zodSpritesheet } from "~/lib/spritesheet";
import { createWorldSpritesheet } from "~/data/convexProxy/spritesheet.server"
import { listWorldTextures } from "~/data/convexProxy/texture.server"
import { type InsertArgs, table } from "@/world/spritesheets";
import formcssHref from "~/form.css?url";
import Toolbar from "~/components/toolbars/entity-save-toolbar";
import { Separator } from "~/components/ui/separator"
import { parseFormError } from "~/lib/error.server"
import { WorldId } from "@/worlds";
import JSON5 from 'json5'
import { TextureComboxProvider, type TextureComboxItem } from "~/routes/world.$worldId.spritesheet/combox-for-texture"
import { useState, useEffect } from 'react'
import { ServerErrors, ClientErrors } from "~/components/convex/type";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: formcssHref },
];
const createSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  textureId: z.string().min(1, { message: "Texture is required" }),
  data: z.string().min(1, { message: "Spritesheet data is required" }),
});

export async function action({
  request,
  params,
}: ActionFunctionArgs) {
  const { worldId } = params;
  if (!worldId) {
    throw new Error("invalid world params!");
  }
  let serverErrors: ServerErrors = {}

  // data json formatter validation
  const formData = await request.formData();
  const _formData = Object.fromEntries(formData);
  let data = null
  try {
    data = JSON5.parse(_formData["data"].toString());
  } catch (ex) {
    serverErrors["data"] = "parse json err"
    return { serverErrors }
  }
  const result0 = zodSpritesheet.safeParse(data);
  if (!result0.success) {
    serverErrors = { ...result0.error.formErrors.fieldErrors }
    serverErrors["data"] = "parse json as spritesheet err"
    console.error(serverErrors)
    return { serverErrors }
  }

  const formPayload = { ..._formData, worldId }
  // console.log('new formPayload=>', formPayload)

  // payload z schema validation
  const result = createSchema.safeParse(formPayload);
  if (result.success) {
    try {
      const newSpritesheetId = await createWorldSpritesheet(formPayload as InsertArgs)
      return redirect(`/world/${worldId}/spritesheet/${newSpritesheetId}`)
    } catch (error) {
      // {field1: errorMessage, ...}
      // console.log('createSchema.keyof()=>', createSchema.keyof().Values)
      const fields = Object.keys(createSchema.keyof().Values)
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
    throw new Error("invalid world params!");
  }
  const textures = await listWorldTextures(worldId as WorldId)
  return { worldId: worldId as WorldId, textures }
}



export default function NewTexture() {
  const { worldId, textures } = useLoaderData<typeof loader>();
  const items = textures.map<TextureComboxItem>(t => ({
    textureId: t._id, name: t.name, textureUrl: t.url
  }))
  const actionData = useActionData<typeof action>();
  const [errors, setErrors] = useState(actionData?.serverErrors)

  useEffect(() => {
    if (actionData && "serverErrors" in actionData) {
      setErrors(actionData.serverErrors)
    }
  }, [actionData])

  const navigation = useNavigation();
  const isSubmitting = navigation.formMethod === "POST" && navigation.formAction === `/world/${worldId}/spritesheet/new`;

  function onClientErrors(clientErrors: ClientErrors) {
    // { ...actionData?.serverErrors, ...clientErrors }
    setErrors(clientErrors)
  }

  return (
    <div className="h-full">
      <TextureComboxProvider value={{ items }}>
        <SpritesheetForm errors={errors} onClientErrors={onClientErrors} schema={createSchema}>
          <Toolbar isSubmitting={isSubmitting} entityName={table} />
          <Separator />
        </SpritesheetForm>
      </TextureComboxProvider>
    </div>
  )
}