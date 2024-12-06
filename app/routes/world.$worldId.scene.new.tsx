import { useNavigation, useLoaderData, useActionData, redirect } from "@remix-run/react";
import type { LoaderFunctionArgs, ActionFunctionArgs, LinksFunction } from "@remix-run/node";
import SceneForm from "~/components/forms/scene-form"
import { z, type ZodObject } from "zod";
import { parseMutationArgumentErrorsToObject, parseConvexErrorToString } from "@/error";
import { createWorldScene } from "~/data/convexProxy/scene.server"
import { type InsertArgs, table } from "@/world/scenes";
import formcssHref from "~/form.css?url";
import Toolbar from "~/components/toolbars/entity-save-toolbar";
import { Separator } from "~/components/ui/separator"
import { parseFormError } from "~/lib/error.server"

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: formcssHref },
];
const createSceneFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  desc: z.string(),
  worldId: z.string(),
});

export async function action({
  request,
  params,
}: ActionFunctionArgs) {
  const { worldId } = params;
  const formData = await request.formData();
  console.log('new formData=>', formData)
  const formPayload = { ...Object.fromEntries(formData), worldId }
  let errors: Record<string, any> = {}
  const result = createSceneFormSchema.safeParse(formPayload);
  if (result.success) {
    try {
      const newSceneId = await createWorldScene(formPayload as InsertArgs)
      // const newSceneId = ''
      console.log("newSceneId=>", newSceneId)
      return redirect(`/world/${worldId}/scene/${newSceneId}`)
    } catch (error) {
      // {field1: errorMessage, ...}
      const fields = Object.keys(createSceneFormSchema.keyof())
      errors = parseFormError(error, fields)

      // let fieldErrors = parseMutationArgumentErrorsToObject(error)
      // let errorMessage = ""
      // if (!fieldErrors) {
      //   errorMessage = parseConvexErrorToString(error);
      //   errors = { "__err__": errorMessage }
      // } else {
      //   errors = { ...fieldErrors }
      // }
    }
  } else {
    // Handle validation errors
    errors = { ...result.error.formErrors.fieldErrors }
  }

  return { errors }
}

export async function loader({ params }: LoaderFunctionArgs) {
  const { worldId } = params;
  if (!worldId) {
    throw new Error("invalid params!");
  }
  return { worldId }
}



export default function NewScene() {
  console.log("in new")
  const { worldId } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.formMethod === "POST" && navigation.formAction === `/world/${worldId}/scene/new`;
  console.log(isSubmitting)
  return (
    <div className="h-full">
      <SceneForm errors={actionData?.errors} schema={createSceneFormSchema}>
        <Toolbar isSubmitting={isSubmitting} entityName={table} />
        <Separator />
      </SceneForm>
    </div>
  )
}