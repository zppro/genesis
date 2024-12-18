import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { ScrollArea } from "~/components/ui/scroll-area"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { FormErrorTip } from "~/components/convex/form"
import { LoaderFunctionArgs, ActionFunctionArgs, LinksFunction } from "@remix-run/node";
import type { WorldId, UpdateArgs } from "@/worlds";
import { getWorld, updateWorld, listWorlds } from "~/data/convexProxy/world.server"
import { z } from "zod";
import { parseIsNotFoundRecordError } from "@/error";
import { parseFormError } from "~/lib/error.server"
import formcssHref from "~/form.css?url";
import Toolbar from "~/components/toolbars/entity-save-toolbar";
import { table } from "@/worlds";
import { Separator } from "~/components/ui/separator"
import { useRootContext } from "~/hooks/use-context"
import { useEffect } from 'react'

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: formcssHref },
];

const updateWorldSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  desc: z.string(),
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
  const formPayload = { ...Object.fromEntries(formData), id: worldId as WorldId }
  let errors: Record<string, any> = {}
  const result = updateWorldSchema.safeParse(formPayload);
  if (result.success) {
    try {
      await updateWorld(formPayload as UpdateArgs)
    } catch (error) {
      // {field1: errorMessage, ...}
      const fields = Object.keys(updateWorldSchema.keyof())
      errors = parseFormError(error, fields)
    }
  } else {
    // Handle validation errors
    errors = { ...result.error.formErrors.fieldErrors }
  }
  // return the refreshed global worlds data for clientside
  const worlds = await listWorlds()
  return { worlds, errors }
}


export async function loader({
  params,
}: LoaderFunctionArgs) {
  const { worldId } = params;
  if (!worldId) {
    throw new Error("invalid world params!");
  }
  let world = null
  try {
    world = await getWorld(worldId as WorldId)
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
    if (world === null) {
      throw new Response(null, {
        status: 404,
        statusText: "Not Found",
      });
    }
    return { world }
  }
}

export default function SettingsIndex() {
  const { world } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const rootContext = useRootContext()
  useEffect(()=> {
    if (actionData?.worlds) {
      rootContext.setWorlds(actionData.worlds)
    }
  }, [actionData])
  console.log('---navigation.formAction---', navigation.formAction)
  const isSubmitting = navigation.formMethod === "POST" && (navigation.formAction?.startsWith(`/world/${world._id}/settings`) ?? false);
  return (
    <Form method="post" className="flex flex-col h-full">
      <Toolbar entityName={table} isSubmitting={isSubmitting} />
      <Separator />
      <ScrollArea className="h-full">
        <div className="w-full p-2">
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name<span className="text-red-500">*</span></Label>
              <Input id="name" name="name" defaultValue={world?.name} placeholder="Name of your world" className={actionData?.errors?.name ? "form-input-err" : undefined} />
              {actionData?.errors?.name ? <FormErrorTip tip={actionData?.errors?.name} /> : null}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" name="desc" defaultValue={world?.desc} placeholder="Description of your world" />
            </div>
          </div>
        </div>
      </ScrollArea>
    </Form>
  )
}