import { useNavigation } from "@remix-run/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { GetOneErrorBoundary } from "~/components/error-boundary"
import { parseIsNotFoundRecordError } from "@/error";
import { useLoaderData, useActionData, redirect } from "@remix-run/react";
import type { ActionFunctionArgs, LinksFunction } from "@remix-run/node";
import TextureForm from "~/routes/world.$worldId.texture/form"
import { z } from "zod";
import { getWorldTexture, updateWorldTexture } from "~/data/convexProxy/texture.server"
import { type TextureId, type UpdateArgs, table } from "@/world/textures";
import formcssHref from "~/form.css?url";
import Toolbar from "~/components/toolbars/entity-save-toolbar";
import { Separator } from "~/components/ui/separator"
import { parseFormError } from "~/lib/error.server"

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: formcssHref },
];

const updateSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  storageId: z.string().min(1, { message: "File is required" })
});

export async function action({
  request,
  params,
}: ActionFunctionArgs) {
  const { worldId, textureId } = params;
  if (!worldId) {
    throw new Error("invalid world params!");
  }
  if (!textureId) {
    throw new Error("invalid textureId param!");
  }
  const formData = await request.formData();
  const formPayload = { ...Object.fromEntries(formData), id: textureId as TextureId }
  let errors: Record<string, any> = {}
  const result = updateSchema.safeParse(formPayload);
  if (result.success) {
    try {
      await updateWorldTexture(formPayload as UpdateArgs)
      return redirect(`/world/${worldId}/texture/${textureId}`)
    } catch (error) {
      // {field1: errorMessage, ...}
      const fields = Object.keys(updateSchema.keyof())
      errors = parseFormError(error, fields)
    }
  } else {
    // Handle validation errors
    errors = { ...result.error.formErrors.fieldErrors }

  }

  return { errors }
}

export async function loader({
  params,
}: LoaderFunctionArgs) {
  const { worldId, textureId } = params;
  if (!worldId) {
    throw new Error("invalid world params!");
  }
  if (!textureId) {
    throw new Error("invalid textureId param!");
  }

  let texture = null
  try {
    texture = await getWorldTexture(textureId as TextureId)
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
    if (texture === null) {
      throw new Response(null, {
        status: 404,
        statusText: "Not Found",
      });
    }
    return { texture }
  }
}

export function ErrorBoundary() {
  return <GetOneErrorBoundary />
}


export default function EditScene() {
  const { texture } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.formMethod === "POST" && navigation.formAction === `/world/${texture?.worldId}/texture/${texture?._id}/edit`;
  return (
    <div className="h-full">
      <TextureForm errors={actionData?.errors} texture={texture!} schema={updateSchema}>
        <Toolbar isSubmitting={isSubmitting} entityName={table} />
        <Separator />
      </TextureForm>
    </div>
  )
}