import { useNavigation } from "@remix-run/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { GetOneErrorBoundary } from "~/components/error-boundary"
import { parseIsNotFoundRecordError } from "@/error";
import { useLoaderData, useActionData, redirect } from "@remix-run/react";
import type { ActionFunctionArgs, LinksFunction } from "@remix-run/node";
import CharacterForm, { mergeNamePrefixsAsObject, formatters } from "~/routes/world.$worldId.character/form"
import { z } from "zod";
import { getWorldCharacter, updateWorldCharacter } from "~/data/convexProxy/character.server"
import { listWorldSpritesheetExtendsByType } from "~/data/convexProxy/spritesheet.server"
import { type CharacterId, table } from "@/world/character/schema";
import { type UpdateArgs } from "@/world/character/args";
import { type SpritesheetTable } from "@/world/spritesheets";
import { WorldId } from "@/worlds";
import formcssHref from "~/form.css?url";
import Toolbar from "~/components/toolbars/entity-save-toolbar";
import { Separator } from "~/components/ui/separator"
import { parseFormError } from "~/lib/error.server"
import { ServerErrors, ClientErrors } from "~/components/convex/type";
import { useState, useEffect } from 'react'
import { ConvexComboxProvider, type ConvexComboxItem } from "~/components/ui/combox"
import { CHARACTERSETTINGS_TYPES } from "@/shared/characterSettings";
import { convertFormDataToObject } from "~/lib/form";
import JSON5 from "json5";
import { zodPrimaryCharacterSettings } from "~/zod/characterSettings";
import RunLLMForm from "~/routes/world.$worldId.character/runLLMForm"
import { listWorldLLMs } from "~/data/convexProxy/llm.server";
import { LLMTable } from "@/world/llms";
import { runLLM } from "~/data/convexProxy/llm.server";
import { RunLLMArgs } from "@/world/llmsAction";
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
  settingsVariant: z.object({
    type: z.enum(CHARACTERSETTINGS_TYPES, { message: "settingsVariant.type is required" }),
    desc: z.string().min(1, { message: "settingsVariant.desc is required" }),
    settings: z.any(),
  })
});

const runLLMSchema = z.object({
  system: z.string().min(1, { message: "System is required" }),
  user: z.string().min(1, { message: "User is required" }),
  llmId: z.string(),
  worldId: z.string(),
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
  let sheetClose = true
  let serverErrors: ServerErrors = {}

  const formData = await request.formData();
  const isSheetFormSubmit = formData.has("llmId")
  if (isSheetFormSubmit) {
    const _formData = convertFormDataToObject(formData);
    const formPayload = { ..._formData, worldId }
    // payload z schema validation
    const result = runLLMSchema.safeParse(formPayload);
    if (result.success) {
      try {
        const formPayload2 = {
          llmId: _formData["llmId"], worldId,
          messages: [
            { role: "system", content: _formData["system"] },
            { role: "user", content: _formData["user"] }
          ]
        }
        const res = await runLLM(formPayload2 as RunLLMArgs)
        return { res, sheetClose }
      } catch (error) {
        // {field1: errorMessage, ...}
        const fields = Object.keys(runLLMSchema.keyof().Values)
        serverErrors = parseFormError(error, fields)
        sheetClose = false;
      }
    } else {
      // Handle validation errors
      serverErrors = { ...result.error.formErrors.fieldErrors }
      sheetClose = false;
    }
  } else {
    const _formData = convertFormDataToObject(formData, { decimalKeys: ["speed"], mergeNamePrefixsAsObject }, formatters);

    // console.log('_formData:', (_formData["settingsVariant"] as Record<string, any>)["settings"])
    let data = null
    try {
      data = JSON5.parse((_formData["settingsVariant"] as Record<string, any>)["settings"]);
    } catch (ex) {
      serverErrors["settingsVariant.settings"] = "parse json err"
      console.log("serverErrors1=>", serverErrors)
      return { serverErrors, sheetClose }
    }

    const result0 = zodPrimaryCharacterSettings.safeParse(data);
    if (!result0.success) {
      serverErrors = { ...result0.error.formErrors.fieldErrors }
      serverErrors["data"] = "parse json as character settings err: " + Object.keys(serverErrors).map(se => serverErrors[se].join()).join()
      console.error(serverErrors)
      return { serverErrors, sheetClose }
    }

    // make json str => json object
    (_formData["settingsVariant"] as Record<string, any>)["settings"] = data;
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
  }



  return { serverErrors, sheetClose }
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
    const llms = await listWorldLLMs(worldId as WorldId)
    const spritesheetExs = await listWorldSpritesheetExtendsByType(worldId as WorldId, "character")
    const breadcrumbData = { routeName: `edit character (${character.name})`, routeUrl: `/world/${worldId}/character/${character._id}/edit` }

    return { ...breadcrumbData, character, llms, spritesheetExs }
  }
}

export function ErrorBoundary() {
  return <GetOneErrorBoundary />
}


export default function EditScene() {
  const { character, llms, spritesheetExs } = useLoaderData<typeof loader>();
  const comboxitems = spritesheetExs.map<ConvexComboxItem<SpritesheetTable>>(t => ({
    key: t._id, text: t.name, icon: t.texture.url
  }))
  const llmItems = llms.map<ConvexComboxItem<LLMTable>>(l => ({
    key: l._id, text: l.name
  }))
  const [sheetOpen, setSheetOpen] = useState(false);
  const [userInput, setUserInput] = useState("");
  const actionData = useActionData<typeof action>();
  const [errors, setErrors] = useState(actionData?.serverErrors)

  useEffect(() => {
    if (actionData && "serverErrors" in actionData) {
      setErrors(actionData.serverErrors)
    }
    if (actionData && "sheetClose" in actionData) {
      const _sheetOpen = !(actionData["sheetClose"] as boolean)
      setSheetOpen(_sheetOpen)
    }
  }, [actionData])

  function onClientErrors(clientErrors: ClientErrors) {
    // { ...actionData?.serverErrors, ...clientErrors }
    setErrors(clientErrors)
  }
  function setResult(v: any) {
    console.log("runLLM result:", v)
  }
  // function onFormChange(payload: Record<string, FormDataEntryValueEx>) {
  //   const desc = (payload["settingsVariant"] as Record<string, any>)["desc"] as string
  //   console.log("desc=>", desc)
  //   setUserInput(desc)
  // }
  function onMagic(useInput: string) {
    console.log("on magic click")
    setUserInput(useInput)
    setSheetOpen(true)
  }
  const navigation = useNavigation();
  const isSubmitting = navigation.formMethod === "POST" && navigation.formAction === `/world/${character?.worldId}/character/${character?._id}/edit`;
  return (
    <div className="h-full">
      <ConvexComboxProvider value={{ items: comboxitems }}>
        <CharacterForm errors={errors}
          onClientErrors={onClientErrors}
          onMagic={onMagic}
          magicReturn={actionData?.res}
          doc={character}
          schema={updateSchema}>
          <Toolbar isSubmitting={isSubmitting} entityName={table} />
          <Separator />
        </CharacterForm>
      </ConvexComboxProvider>
      <RunLLMForm
        errors={errors}
        userInput={userInput}
        setResult={setResult}
        onClientErrors={onClientErrors}
        schema={runLLMSchema}
        llmItems={llmItems}
        isSubmitting={isSubmitting}
        open={sheetOpen}
        setOpen={setSheetOpen}
      >
      </RunLLMForm>
    </div>
  )
}