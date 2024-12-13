import { useNavigation, useLoaderData, useActionData, redirect } from "@remix-run/react";
import type { LoaderFunctionArgs, ActionFunctionArgs, LinksFunction } from "@remix-run/node";
import CharacterForm from "~/routes/world.$worldId.character/form"
import { z } from "zod";
import { createWorldCharacter } from "~/data/convexProxy/character.server"
import { type InsertArgs, table } from "@/world/characters";
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
  speed: z.number().gt(0),
  worldId: z.string(),
  textureStorageId: z.string(),
  spritesheetStorageId: z.string(),
});

export async function action({
  request,
  params,
}: ActionFunctionArgs) {
  const { worldId, type } = params;
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
      const newCharacterId = await createWorldCharacter(formPayload as InsertArgs)
      return redirect(`/world/${worldId}/character/${newCharacterId}`)
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



export default function NewScene() {
  const { worldId } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.formMethod === "POST" && navigation.formAction === `/world/${worldId}/character/new`;
  return (
    <div className="h-full">
      <CharacterForm errors={actionData?.errors} schema={createSchema}>
        <Toolbar isSubmitting={isSubmitting} entityName={table} />
        <Separator />
      </CharacterForm>
    </div>
  )
}