import { useNavigation, useLoaderData, useActionData, redirect } from "@remix-run/react";
import type { LoaderFunctionArgs, ActionFunctionArgs, LinksFunction } from "@remix-run/node";
import McpServerForm from "~/routes/world.$worldId.mcpServer/form"
import { z } from "zod";
import { createWorldMcpServer } from "~/data/convexProxy/mcpServer.server"
import { type InsertArgs } from "@/world/mcpServer/args";
import { MCPSERVER_TYPES } from "@/world/mcpServer/schema";
import { table } from "@/world/mcpServer/schema";
import formcssHref from "~/form.css?url";
import Toolbar from "~/components/toolbars/entity-save-toolbar";
import { Separator } from "~/components/ui/separator"
import { parseFormError } from "~/lib/error.server"
import { WorldId } from "@/worlds";
import { useState, useEffect } from 'react'
import { ServerErrors, ClientErrors } from "~/components/convex/type";
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
  url: z.string().min(1, { message: "url is required" }).url({ message: "website format" }),
  type: z.enum(MCPSERVER_TYPES, { message: "Type is required" }),
  desc: z.string(),
  worldId: z.string(),
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
  // const _formData = convertFormDataToObject(formData, { mergeNamePrefixsAsObject }, formatters);
  // if (typeof (_formData.functionDef as Record<string, any>).schema === 'string') {
  //   const schemaRawVal = (_formData.functionDef as Record<string, any>).schema as string
  //   (_formData.functionDef as Record<string, any>).schema = JSON5.parse(schemaRawVal)
  // }

  const _formData = convertFormDataToObject(formData);
  const formPayload = { ..._formData, worldId }
  console.log('new formPayload=>', formPayload)

  // payload z schema validation
  const result = createSchema.safeParse(formPayload);
  if (result.success) {
    try {
      const newMcpServerId = await createWorldMcpServer(formPayload as InsertArgs)
      return redirect(`/world/${worldId}/mcpServer/${newMcpServerId}`)
    } catch (error) {
      // {field1: errorMessage, ...}
      console.log('error:', error)
      const fields = Object.keys(createSchema.keyof().Values)
      serverErrors = parseFormError(error, fields)
    }
  } else {
    // Handle validation errors
    console.log(result.error)
    serverErrors = { ...result.error.formErrors.fieldErrors }
  }

  return { serverErrors }
}

export async function loader({ params }: LoaderFunctionArgs) {
  const { worldId } = params;
  if (!worldId) {
    throw new Error("invalid world params!");
  }
  const breadcrumbData = { routeName: "create new mcpServer", routeUrl: `/world/${worldId}/mcpServer/new` }

  return { ...breadcrumbData, worldId: worldId as WorldId }
}

export default function NewScene() {
  const { worldId } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [errors, setErrors] = useState(actionData?.serverErrors)

  useEffect(() => {
    if (actionData && "serverErrors" in actionData) {
      setErrors(actionData.serverErrors)
    }
  }, [actionData])

  const navigation = useNavigation();
  const isSubmitting = navigation.formMethod === "POST" && navigation.formAction === `/world/${worldId}/mcpServer/new`;
  function onClientErrors(clientErrors: ClientErrors) {
    // { ...actionData?.serverErrors, ...clientErrors }
    setErrors(clientErrors)
  }
  return (
    <div className="h-full">
      <McpServerForm
        errors={errors} onClientErrors={onClientErrors} schema={createSchema} >
        <Toolbar isSubmitting={isSubmitting} entityName={table} />
        <Separator />
      </McpServerForm>
    </div>
  )
}