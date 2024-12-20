import { useNavigation } from "@remix-run/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { GetOneErrorBoundary } from "~/components/error-boundary"
import { parseIsNotFoundRecordError } from "@/error";
import { useLoaderData, useActionData, redirect } from "@remix-run/react";
import type { ActionFunctionArgs, LinksFunction } from "@remix-run/node";
import ObjectForm from "~/routes/world.$worldId.object/form"
import { z } from "zod";
import { getWorldObject, updateWorldObject } from "~/data/convexProxy/object.server"
import { listWorldSpritesheetExtendsByType } from "~/data/convexProxy/spritesheet.server"
import { type ObjectId, type UpdateArgs, table, OBJECT_TYPES } from "@/world/objects";
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

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: formcssHref },
];

const updateSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  type: z.enum(OBJECT_TYPES, { message: "Type is required" }),
  spritesheetId: z.string().min(1, { message: "Spritesheet is required" }),
});

export async function action({
  request,
  params,
}: ActionFunctionArgs) {
  const { worldId, objectId } = params;
  if (!worldId) {
    throw new Error("invalid world params!");
  }
  if (!objectId) {
    throw new Error("invalid objectId param!");
  }
  let serverErrors: ServerErrors = {}

  const formData = await request.formData();
  const _formData = convertFormDataToObject(formData);
  const formPayload = { ..._formData, id: objectId as ObjectId }

  // payload z schema validation
  const result = updateSchema.safeParse(formPayload);
  if (result.success) {
    try {
      await updateWorldObject(formPayload as UpdateArgs)
      return redirect(`/world/${worldId}/object/${objectId}`)
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
  const { worldId, objectId } = params;
  if (!worldId) {
    throw new Error("invalid world params!");
  }
  if (!objectId) {
    throw new Error("invalid objectId param!");
  }

  let object = null
  try {
    object = await getWorldObject(objectId as ObjectId)
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
    if (object === null) {
      throw new Response(null, {
        status: 404,
        statusText: "Not Found",
      });
    }
    const spritesheetExs = await listWorldSpritesheetExtendsByType(worldId as WorldId, "object")
    return { object, spritesheetExs }
  }
}

export function ErrorBoundary() {
  return <GetOneErrorBoundary />
}


export default function EditScene() {
  const { object, spritesheetExs } = useLoaderData<typeof loader>();
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
    console.log('onClientErrors', clientErrors)
    setErrors(clientErrors)
  }

  const navigation = useNavigation();
  const isSubmitting = navigation.formMethod === "POST" && navigation.formAction === `/world/${object?.worldId}/character/${object?._id}/edit`;
  return (
    <div className="h-full">
      <ConvexComboxProvider value={{ items: comboxitems }}>
        <ObjectForm errors={errors} onClientErrors={onClientErrors} doc={object} schema={updateSchema}>
          <Toolbar isSubmitting={isSubmitting} entityName={table} />
          <Separator />
        </ObjectForm>
      </ConvexComboxProvider>
    </div>
  )
}