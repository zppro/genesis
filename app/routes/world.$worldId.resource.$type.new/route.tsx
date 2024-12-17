import { useNavigation, useLoaderData, useActionData, redirect } from "@remix-run/react";
import type { LoaderFunctionArgs, ActionFunctionArgs, LinksFunction } from "@remix-run/node";
import ResourceForm from "~/routes/world.$worldId.resource.$type/form"
import { z, type ZodObject } from "zod";
import { parseMutationArgumentErrorsToObject, parseConvexErrorToString } from "@/error";
import { createWorldResource } from "~/data/convexProxy/resource.server"
import { type InsertArgs, ResourceTypes, table } from "@/world/resources";
import formcssHref from "~/form.css?url";
import Toolbar from "~/components/toolbars/entity-save-toolbar";
import { Separator } from "~/components/ui/separator"
import { parseFormError } from "~/lib/error.server"
import { WorldId } from "@/worlds";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: formcssHref },
];
const createSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  desc: z.string(),
  worldId: z.string(),
  storageId: z.string(),
});

export async function action({
  request,
  params,
}: ActionFunctionArgs) {
  const { worldId, type } = params;
  if (!worldId) {
    throw new Error("invalid world params!");
  }
  if (!type) {
    throw new Error("invalid type param!");
  }
  const formData = await request.formData();
  const formPayload = { ...Object.fromEntries(formData), worldId, type }
  // console.log('new formPayload=>', formPayload)
  let errors: Record<string, any> = {}
  const result = createSchema.safeParse(formPayload);
  if (result.success) {
    try {
      const newResourceId = await createWorldResource(formPayload as InsertArgs)
      return redirect(`/world/${worldId}/resource/${type}/${newResourceId}`)
    } catch (error) {
      // {field1: errorMessage, ...}
      const fields = Object.keys(createSchema.keyof().Values)
      errors = parseFormError(error, fields)
    }
  } else {
    // Handle validation errors
    errors = { ...result.error.formErrors.fieldErrors }
  }

  return { errors }
}

export async function loader({ params }: LoaderFunctionArgs) {
  const { worldId, type } = params;
  if (!worldId) {
    throw new Error("invalid world params!");
  }
  if (!type) {
    throw new Error("invalid type param!");
  }
  return { worldId: worldId as WorldId, type: type as ResourceTypes }
}



export default function NewScene() {
  const { worldId, type } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.formMethod === "POST" && navigation.formAction === `/world/${worldId}/resource/${type}/new`;
  return (
    <div className="h-full">
      <ResourceForm errors={actionData?.errors} type={type} schema={createSchema}>
        <Toolbar isSubmitting={isSubmitting} entityName={table} />
        <Separator />
      </ResourceForm>
    </div>
  )
}