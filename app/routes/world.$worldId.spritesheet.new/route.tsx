import { useNavigation, useLoaderData, useActionData, redirect } from "@remix-run/react";
import type { LoaderFunctionArgs, ActionFunctionArgs, LinksFunction } from "@remix-run/node";
import SpritesheetForm from "~/routes/world.$worldId.spritesheet/form"
import { z } from "zod";
import { zodSpritesheet } from "~/lib/spritesheet";
import { createWorldSpritesheet } from "~/data/convexProxy/spritesheet.server"
import { type InsertArgs, table } from "@/world/spritesheets";
import formcssHref from "~/form.css?url";
import Toolbar from "~/components/toolbars/entity-save-toolbar";
import { Separator } from "~/components/ui/separator"
import { parseFormError } from "~/lib/error.server"
import { WorldId } from "@/worlds";
import JSON5 from 'json5'

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: formcssHref },
];
const createSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  worldId: z.string(),
  data: z.string(),
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
  let errors: Record<string, any> = {}
  const _form = Object.fromEntries(formData);
  let data = null
  try {
    data = JSON5.parse(_form["data"].toString());
  } catch (ex) {
    errors["__err__"] = "parse json err"
    return { errors }
  }
  const result0 = zodSpritesheet.safeParse(data);
  if (!result0.success) {
    errors = { ...result0.error.formErrors.fieldErrors }
    errors["__err__"] = "parse json as spritesheet err"
    console.error(errors)
    return { errors }
  }
  const formPayload = { ..._form, worldId }
  // console.log('new formPayload=>', formPayload)
  const result = createSchema.safeParse(formPayload);
  if (result.success) {
    try {
      const newSpritesheetId = await createWorldSpritesheet(formPayload as InsertArgs)
      return redirect(`/world/${worldId}/spritesheet/${newSpritesheetId}`)
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
  const isSubmitting = navigation.formMethod === "POST" && navigation.formAction === `/world/${worldId}/spritesheet/new`;
  return (
    <div className="h-full">
      <SpritesheetForm errors={actionData?.errors} schema={createSchema}>
        <Toolbar isSubmitting={isSubmitting} entityName={table} />
        <Separator />
      </SpritesheetForm>
    </div>
  )
}