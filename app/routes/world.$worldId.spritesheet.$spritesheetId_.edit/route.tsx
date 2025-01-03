import { useNavigation } from "@remix-run/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { GetOneErrorBoundary } from "~/components/error-boundary"
import { parseIsNotFoundRecordError } from "@/error";
import { useLoaderData, useActionData, redirect } from "@remix-run/react";
import type { ActionFunctionArgs, LinksFunction } from "@remix-run/node";
import SpritesheetForm from "~/routes/world.$worldId.spritesheet/form"
import { object, z } from "zod";
import { zodSpritesheet } from "~/lib/spritesheet";
import { getWorldSpritesheet, updateWorldSpritesheet } from "~/data/convexProxy/spritesheet.server"
import { listWorldTextures } from "~/data/convexProxy/texture.server"
import { type SpritesheetId, type UpdateArgs, table, SPRITESHEET_TYPES } from "@/world/spritesheets";
import { WorldId } from "@/worlds";
import formcssHref from "~/form.css?url";
import Toolbar from "~/components/toolbars/entity-save-toolbar";
import { Separator } from "~/components/ui/separator"
import { parseFormError } from "~/lib/error.server"
import { TextureComboxProvider, type TextureComboxItem } from "~/routes/world.$worldId.spritesheet/combox-for-texture"
import { ServerErrors, ClientErrors } from "~/components/convex/type";
import JSON5 from 'json5'
import { useState, useEffect } from 'react'

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: formcssHref },
];

const updateSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  type: z.enum(SPRITESHEET_TYPES, { message: "Type is required" }),
  textureId: z.string().min(1, { message: "Texture is required" }),
  data: z.string().min(1, { message: "Spritesheet data is required" }),
});

export async function action({
  request,
  params,
}: ActionFunctionArgs) {
  const { worldId, spritesheetId } = params;
  if (!worldId) {
    throw new Error("invalid world params!");
  }
  if (!spritesheetId) {
    throw new Error("invalid spritesheetId param!");
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
    serverErrors["data"] = "parse json as spritesheet err: "+ Object.keys(serverErrors).map(se=>serverErrors[se].join()).join()
    console.error(serverErrors)
    return { serverErrors }
  }

  // const formPayload = { ...Object.fromEntries(formData), id: spritesheetId as SpritesheetId }
  const formPayload = { ..._formData, id: spritesheetId as SpritesheetId }

  const result = updateSchema.safeParse(formPayload);
  if (result.success) {
    try {
      await updateWorldSpritesheet(formPayload as UpdateArgs)
      return redirect(`/world/${worldId}/spritesheet/${spritesheetId}`)
    } catch (error) {
      // {field1: errorMessage, ...}
      const fields = Object.keys(updateSchema.keyof().Values)
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
  const { worldId, spritesheetId } = params;
  if (!worldId) {
    throw new Error("invalid world params!");
  }
  if (!spritesheetId) {
    throw new Error("invalid spritesheetId param!");
  }
  const textures = await listWorldTextures(worldId as WorldId)
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
    return { spritesheet, textures }
  }
}

export function ErrorBoundary() {
  return <GetOneErrorBoundary />
}


export default function EditScene() {
  const { spritesheet, textures } = useLoaderData<typeof loader>();
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
  function onClientErrors(clientErrors: ClientErrors) {
    // { ...actionData?.serverErrors, ...clientErrors }
    setErrors(clientErrors)
  }

  const navigation = useNavigation();
  const isSubmitting = navigation.formMethod === "POST" && navigation.formAction === `/world/${spritesheet?.worldId}/spritesheet/${spritesheet?._id}/edit`;
  return (
    <div className="h-full">
      <TextureComboxProvider value={{ items }}>
        <SpritesheetForm errors={errors} onClientErrors={onClientErrors} doc={spritesheet!} schema={updateSchema}>
          <Toolbar isSubmitting={isSubmitting} entityName={table} />
          <Separator />
        </SpritesheetForm>
      </TextureComboxProvider>
    </div>
  )
}