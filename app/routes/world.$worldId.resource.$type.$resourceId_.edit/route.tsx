import { useNavigation } from "@remix-run/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { GetOneErrorBoundary } from "~/components/error-boundary"
import { parseIsNotFoundRecordError } from "@/error";
import { useLoaderData, useActionData, redirect } from "@remix-run/react";
import type { ActionFunctionArgs, LinksFunction } from "@remix-run/node";
import SceneForm from "~/routes/world.$worldId.resource.$type/form"
import { z } from "zod";
import { getWorldResource, updateWorldResource } from "~/data/convexProxy/resource.server"
import { type ResourceId, type UpdateArgs, table } from "@/world/resources";
import formcssHref from "~/form.css?url";
import Toolbar from "~/components/toolbars/entity-save-toolbar";
import { Separator } from "~/components/ui/separator"
import { parseFormError } from "~/lib/error.server"

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: formcssHref },
];

const updateSceneFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  desc: z.string(),
  storageId: z.string().min(1, { message: "File is required" })
});

export async function action({
  request,
  params,
}: ActionFunctionArgs) {
  const { worldId, type, resourceId } = params;
  if (!worldId) {
    throw new Error("invalid world params!");
  }
  if (!type) {
    throw new Error("invalid type param!");
  }
  if (!resourceId) {
    throw new Error("invalid resourceId param!");
  }
  const formData = await request.formData();
  const formPayload = { ...Object.fromEntries(formData), id: resourceId as ResourceId }
  let errors: Record<string, any> = {}
  const result = updateSceneFormSchema.safeParse(formPayload);
  if (result.success) {
    try {
      await updateWorldResource(formPayload as UpdateArgs)
      return redirect(`/world/${worldId}/resource/${type}/${resourceId}`)
    } catch (error) {
      // {field1: errorMessage, ...}
      const fields = Object.keys(updateSceneFormSchema.keyof().Values)
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
  const { worldId, type, resourceId } = params;
  if (!worldId) {
    throw new Error("invalid world params!");
  }
  if (!type) {
    throw new Error("invalid type param!");
  }
  if (!resourceId) {
    throw new Error("invalid resourceId param!");
  }

  let resource = null
  try {
    resource = await getWorldResource(resourceId as ResourceId)
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
    if (resource === null) {
      throw new Response(null, {
        status: 404,
        statusText: "Not Found",
      });
    }
    return { resource }
  }
}

export function ErrorBoundary() {
  return <GetOneErrorBoundary />
}


export default function EditScene() {
  const { resource } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.formMethod === "POST" && navigation.formAction === `/world/${resource?.worldId}/resource/${resource?.type}/${resource?._id}/edit`;
  return (
    <div className="h-full">
      <SceneForm errors={actionData?.errors} resource={resource!} type={resource.type} schema={updateSceneFormSchema}>
        <Toolbar isSubmitting={isSubmitting} entityName={table} />
        <Separator />
      </SceneForm>
    </div>
  )
}