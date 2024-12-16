import { useNavigation, useLoaderData, useActionData, redirect } from "@remix-run/react";
import type { LoaderFunctionArgs, ActionFunctionArgs, LinksFunction } from "@remix-run/node";
import TextureForm from "~/routes/world.$worldId.texture/form"
import { z } from "zod";
import { createWorldTexture } from "~/data/convexProxy/texture.server"
import { type InsertArgs, table } from "@/world/textures";
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
  worldId: z.string(),
  storageId: z.string(),
});

export async function action({
  request,
  params,
}: ActionFunctionArgs) {
  const { worldId } = params;
  if (!worldId) {
    throw new Error("invalid world params!");
  }
  const formData = await request.formData();
  const formPayload = { ...Object.fromEntries(formData), worldId }
  // console.log('new formPayload=>', formPayload)
  let errors: Record<string, any> = {}
  const result = createSchema.safeParse(formPayload);
  if (result.success) {
    try {
      const newTextureId = await createWorldTexture(formPayload as InsertArgs)
      return redirect(`/world/${worldId}/texture/${newTextureId}`)
    } catch (error) {
      // {field1: errorMessage, ...}
      const fields = Object.keys(createSchema.keyof())
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
    throw new Error("invalid world params!");
  }
  return { worldId: worldId as WorldId }
}



export default function NewTexture() {
  const { worldId } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.formMethod === "POST" && navigation.formAction === `/world/${worldId}/texture/new`;
  return (
    <div className="h-full">
      <TextureForm errors={actionData?.errors} schema={createSchema}>
        <Toolbar isSubmitting={isSubmitting} entityName={table} />
        <Separator />
      </TextureForm>
    </div>
  )
}