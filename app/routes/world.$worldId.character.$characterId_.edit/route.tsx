import { useNavigation } from "@remix-run/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { GetOneErrorBoundary } from "~/components/error-boundary"
import { parseIsNotFoundRecordError } from "@/error";
import { useLoaderData, useActionData, redirect } from "@remix-run/react";
import type { ActionFunctionArgs, LinksFunction } from "@remix-run/node";
import CharacterForm from "~/routes/world.$worldId.character/form"
import { z } from "zod";
import { getWorldCharacter, updateWorldCharacter } from "~/data/convexProxy/character.server"
import { listWorldSpritesheetExtendsByType } from "~/data/convexProxy/spritesheet.server"
import { type CharacterId, type UpdateArgs, table } from "@/world/characters";
import { type SpritesheetTable } from "@/world/spritesheets";
import { WorldId } from "@/worlds";
import formcssHref from "~/form.css?url";
import Toolbar from "~/components/toolbars/entity-save-toolbar";
import { Separator } from "~/components/ui/separator"
import { parseFormError } from "~/lib/error.server"
import { ServerErrors, ClientErrors } from "~/components/convex/type";
import { useState, useEffect } from 'react'
import { ConvexComboxProvider, type ConvexComboxItem } from "~/components/ui/combox"
import { convertFormDataToObject } from "~/lib/form";
import { Handle } from "~/lib/routeHandle";
import { breadcrumb } from "~/components/app-breadcrumb";

export const handle: Handle = {
  breadcrumb
};
export const links: LinksFunction = () => [
  { rel: "stylesheet", href: formcssHref },
];

const updateSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  speed: z.number().gt(0),
  spritesheetId: z.string().min(1, { message: "Spritesheet is required" }),
});

export async function action({
  request,
  params,
}: ActionFunctionArgs) {
  const { worldId, characterId } = params;
  if (!worldId) {
    throw new Error("invalid world params!");
  }
  if (!characterId) {
    throw new Error("invalid characterId param!");
  }
  let serverErrors: ServerErrors = {}

  const formData = await request.formData();
  const _formData = convertFormDataToObject(formData, { decimalKeys: ["speed"] });
  const formPayload = { ..._formData, id: characterId as CharacterId }

  // payload z schema validation
  const result = updateSchema.safeParse(formPayload);
  if (result.success) {
    try {
      await updateWorldCharacter(formPayload as UpdateArgs)
      return redirect(`/world/${worldId}/character/${characterId}`)
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
  const { worldId, characterId } = params;
  if (!worldId) {
    throw new Error("invalid world params!");
  }
  if (!characterId) {
    throw new Error("invalid characterId param!");
  }
  
  let character = null
  try {
    character = await getWorldCharacter(characterId as CharacterId)
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
    if (character === null) {
      throw new Response(null, {
        status: 404,
        statusText: "Not Found",
      });
    }
    const spritesheetExs = await listWorldSpritesheetExtendsByType(worldId as WorldId, "character")
    const breadcrumbData = { routeName: `edit llm (${character.name})`, routeUrl: `/world/${worldId}/character/${character._id}/edit` }

    return {...breadcrumbData, character, spritesheetExs }
  }
}

export function ErrorBoundary() {
  return <GetOneErrorBoundary />
}


export default function EditScene() {
  const { character, spritesheetExs } = useLoaderData<typeof loader>();
  const comboxitems = spritesheetExs.map<ConvexComboxItem<SpritesheetTable>>(t => ({
    key: t._id, text: t.name, icon: t.texture.url
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
  const isSubmitting = navigation.formMethod === "POST" && navigation.formAction === `/world/${character?.worldId}/character/${character?._id}/edit`;
  return (
    <div className="h-full">
      <ConvexComboxProvider value={{ items: comboxitems }}>
        <CharacterForm errors={errors} onClientErrors={onClientErrors} doc={character} schema={updateSchema}>
          <Toolbar isSubmitting={isSubmitting} entityName={table} />
          <Separator />
        </CharacterForm>
      </ConvexComboxProvider>
    </div>
  )
}