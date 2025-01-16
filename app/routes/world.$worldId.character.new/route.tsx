import { useNavigation, useLoaderData, useActionData, redirect } from "@remix-run/react";
import type { LoaderFunctionArgs, ActionFunctionArgs, LinksFunction } from "@remix-run/node";
import CharacterForm, { mergeNamePrefixsAsObject } from "~/routes/world.$worldId.character/form"
import { z } from "zod";
import { createWorldCharacter } from "~/data/convexProxy/character.server"
import { listWorldSpritesheetExtendsByType } from "~/data/convexProxy/spritesheet.server";
import { type InsertArgs, table } from "@/world/characters";
import formcssHref from "~/form.css?url";
import Toolbar from "~/components/toolbars/entity-save-toolbar";
import { Separator } from "~/components/ui/separator"
import { parseFormError } from "~/lib/error.server"
import { WorldId } from "@/worlds";
import { type SpritesheetTable, SPRITESHEET_TYPES, type SpritesheetTypes } from "@/world/spritesheets";
import { useState, useEffect } from 'react'
import { ServerErrors, ClientErrors } from "~/components/convex/type";
import { ConvexComboxProvider, type ConvexComboxItem } from "~/components/ui/combox"
import { PrimaryCharacterSettings, CHARACTERSETTINGS_TYPES } from "@/shared/characterSettings";
import { convertFormDataToObject } from "~/lib/form";
import { Handle } from "~/lib/routeHandle";
import { breadcrumb } from "~/components/app-breadcrumb";

export const handle: Handle = {
  breadcrumb
};

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: formcssHref },
];
const createSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  speed: z.number().gt(0),
  spritesheetId: z.string().min(1, { message: "Spritesheet is required" }),
  settingsVariant: z.object({
    type: z.enum(CHARACTERSETTINGS_TYPES, { message: "settingsVariant.type is required" }),
    desc: z.string().min(1, { message: "settingsVariant.desc is required" }),
    settings: z.any(),
  })
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

  const formData = await request.formData();
  const _formData = convertFormDataToObject(formData, { decimalKeys: ["speed"], mergeNamePrefixsAsObject });
  const formPayload = { ..._formData, worldId }
  // console.log('new formPayload=>', formPayload)

  // payload z schema validation
  const result = createSchema.safeParse(formPayload);
  if (result.success) {
    try {
      const newCharacterId = await createWorldCharacter(formPayload as InsertArgs)
      return redirect(`/world/${worldId}/character/${newCharacterId}`)
    } catch (error) {
      // {field1: errorMessage, ...}
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
  const spritesheetExs = await listWorldSpritesheetExtendsByType(worldId as WorldId, "character")
  const breadcrumbData = { routeName: "create new llm", routeUrl: `/world/${worldId}/character/new` }

  return { ...breadcrumbData, worldId: worldId as WorldId, spritesheetExs }
}



export default function NewScene() {
  const { worldId, spritesheetExs } = useLoaderData<typeof loader>();
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

  const navigation = useNavigation();
  const isSubmitting = navigation.formMethod === "POST" && navigation.formAction === `/world/${worldId}/character/new`;
  function onClientErrors(clientErrors: ClientErrors) {
    // { ...actionData?.serverErrors, ...clientErrors }
    setErrors(clientErrors)
  }
  return (
    <div className="h-full">
      <ConvexComboxProvider value={{ items: comboxitems }}>
        <CharacterForm errors={errors} onClientErrors={onClientErrors} schema={createSchema} >
          <Toolbar isSubmitting={isSubmitting} entityName={table} />
          <Separator />
        </CharacterForm>
      </ConvexComboxProvider>
    </div>
  )
}