import { useNavigation, useLoaderData, useActionData, redirect } from "@remix-run/react";
import type { LoaderFunctionArgs, ActionFunctionArgs, LinksFunction } from "@remix-run/node";
import SkillForm from "~/routes/world.$worldId.skill/form"
import { z } from "zod";
import { createWorldSkill } from "~/data/convexProxy/skill.server"
import { listWorldTextures } from "~/data/convexProxy/texture.server"
import { type InsertArgs } from "@/world/skill/args";
import { table } from "@/world/skill/schema";
import formcssHref from "~/form.css?url";
import Toolbar from "~/components/toolbars/entity-save-toolbar";
import { Separator } from "~/components/ui/separator"
import { parseFormError } from "~/lib/error.server"
import { WorldId } from "@/worlds";
import { type TextureTable } from "@/world/textures";
import { useState, useEffect } from 'react'
import { ServerErrors, ClientErrors } from "~/components/convex/type";
import { ConvexComboxProvider, type ConvexComboxItem } from "~/components/ui/combox"
import { convertFormDataToObject } from "~/lib/form";
import { Handle } from "~/lib/routeHandle";
import { breadcrumb } from "~/components/app-breadcrumb";

export const handle: Handle = {
  breadcrumb
};

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: formcssHref },
];
const createSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  desc: z.string(),
  textureId: z.string().min(1, { message: "Texture is required" }),
});

export async function action({
  request,
  params,
}: ActionFunctionArgs) {
  const { worldId } = params;
  if (!worldId) {
    throw new Error("invalid world params!");
  }
  let serverErrors: ServerErrors = {}

  const formData = await request.formData();
  const _formData = convertFormDataToObject(formData);
  const formPayload = { ..._formData, worldId }
  // console.log('new formPayload=>', formPayload)

  // payload z schema validation
  const result = createSchema.safeParse(formPayload);
  if (result.success) {
    try {
      const newObjectId = await createWorldSkill(formPayload as InsertArgs)
      return redirect(`/world/${worldId}/skill/${newObjectId}`)
    } catch (error) {
      // {field1: errorMessage, ...}
      const fields = Object.keys(createSchema.keyof().Values)
      serverErrors = parseFormError(error, fields)
    }
  } else {
    // Handle validation errors
    serverErrors = { ...result.error.formErrors.fieldErrors }
  }

  return { serverErrors }
}

export async function loader({ params }: LoaderFunctionArgs) {
  const { worldId } = params;
  if (!worldId) {
    throw new Error("invalid world params!");
  }
  const textures = await listWorldTextures(worldId as WorldId)
  const breadcrumbData = { routeName: "create new skill", routeUrl: `/world/${worldId}/skill/new` }

  return { ...breadcrumbData, worldId: worldId as WorldId, textures }
}

export default function NewScene() {
  const { worldId, textures } = useLoaderData<typeof loader>();
  const comboxitems = textures.map<ConvexComboxItem<TextureTable>>(t => ({
    key: t._id, text: t.name, icon: t.url
  }))
  const actionData = useActionData<typeof action>();
  const [errors, setErrors] = useState(actionData?.serverErrors)

  useEffect(() => {
    if (actionData && "serverErrors" in actionData) {
      setErrors(actionData.serverErrors)
    }
  }, [actionData])

  const navigation = useNavigation();
  const isSubmitting = navigation.formMethod === "POST" && navigation.formAction === `/world/${worldId}/skill/new`;
  function onClientErrors(clientErrors: ClientErrors) {
    // { ...actionData?.serverErrors, ...clientErrors }
    setErrors(clientErrors)
  }
  return (
    <div className="h-full">
      <ConvexComboxProvider value={{ items: comboxitems }}>
        <SkillForm errors={errors} onClientErrors={onClientErrors} schema={createSchema} >
          <Toolbar isSubmitting={isSubmitting} entityName={table} />
          <Separator />
        </SkillForm>
      </ConvexComboxProvider>
    </div>
  )
}