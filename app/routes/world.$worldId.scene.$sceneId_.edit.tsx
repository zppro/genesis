import { useNavigation } from "@remix-run/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { GetOneErrorBoundary } from "~/components/error-boundary"
import { parseIsNotFoundRecordError } from "@/error";
import { useLoaderData, useActionData, redirect } from "@remix-run/react";
import type { ActionFunctionArgs, LinksFunction } from "@remix-run/node";
import SceneForm from "~/components/forms/scene-form"
import { z } from "zod";
import { parseMutationArgumentErrorsToObject, parseConvexErrorToString } from "@/error";
import { getWorldScene, updateWorldScene } from "~/data/convexProxy/scene.server"
import { type SceneId, type UpdateArgs, table } from "@/world/scenes";
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
});

export async function action({
  request,
  params,
}: ActionFunctionArgs) {
  const { worldId, sceneId } = params;
  const formData = await request.formData();
  const formPayload = { ...Object.fromEntries(formData), id: sceneId as SceneId }
  console.log('edit formPayload=>', formPayload)
  let errors: Record<string, any> = {}
  const result = updateSceneFormSchema.safeParse(formPayload);
  if (result.success) {
    try {
      await updateWorldScene(formPayload as UpdateArgs)
      return redirect(`/world/${worldId}/scene/${sceneId}`)
    } catch (error) {
      // {field1: errorMessage, ...}
      const fields = Object.keys(updateSceneFormSchema.keyof())
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
  const { sceneId } = params;
  console.log('edit sceneId=>', sceneId)
  try {
    const scene = await getWorldScene(sceneId as SceneId)
    return { scene }
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
}

export function ErrorBoundary() {
  return <GetOneErrorBoundary />
}


export default function EditScene() {
  console.log("in edit")
  const { scene } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.formMethod === "POST" && navigation.formAction === `/world/${scene?.worldId}/scene/${scene?._id}/edit`;
  console.log('edit isSubmitting:', isSubmitting)
  console.log(isSubmitting)
  return (
    <div className="h-full">
      <SceneForm errors={actionData?.errors} scene={scene!} schema={updateSceneFormSchema}>
        <Toolbar isSubmitting={isSubmitting} entityName={table} />
        <Separator />
      </SceneForm>
    </div>
  )
}