import { useNavigation, useLoaderData, useActionData, redirect } from "@remix-run/react";
import type { LoaderFunctionArgs, ActionFunctionArgs, LinksFunction } from "@remix-run/node";
import ResourceForm from "~/routes/world.$worldId.resource/form"
import { z, type ZodObject } from "zod";
import { parseMutationArgumentErrorsToObject, parseConvexErrorToString } from "@/error";
import { createWorldResource } from "~/data/convexProxy/resource.server"
import { type InsertArgs, table } from "@/world/resources";
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
  storageId: z.string(),
});

export async function action({
  request,
  params,
}: ActionFunctionArgs) {
  const url = new URL(request.url);
  let type = url.searchParams.get("type");
  if (!type) {
    throw new Error("invalid search param!");
  }
  const { worldId } = params;
  if (!worldId) {
    throw new Error("invalid params!");
  }
  console.log('action resource worldId=>', worldId)

  const formData = await request.formData();
  const formPayload = { ...Object.fromEntries(formData), worldId, type }
  console.log('new formPayload=>', formPayload)
  let errors: Record<string, any> = {}
  const result = createSceneFormSchema.safeParse(formPayload);
  if (result.success) {
    try {
      const newResourceId = await createWorldResource(formPayload as InsertArgs)
      // const newSceneId = ''
      console.log("newResourceId=>", newResourceId)
      return redirect(`/world/${worldId}/resource/${newResourceId}?type=${type}`)
    } catch (error) {
      // {field1: errorMessage, ...}
      const fields = Object.keys(createSceneFormSchema.keyof())
      errors = parseFormError(error, fields)
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
  console.log("resouce in new")
  const { worldId } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.formMethod === "POST" && navigation.formAction === `/world/${worldId}/resource/new`;
  console.log(isSubmitting)
  return (
    <div className="h-full">
      <ResourceForm errors={actionData?.errors} schema={createSceneFormSchema}>
        <Toolbar isSubmitting={isSubmitting} entityName={table} />
        <Separator />
      </ResourceForm>
    </div>
  )
}