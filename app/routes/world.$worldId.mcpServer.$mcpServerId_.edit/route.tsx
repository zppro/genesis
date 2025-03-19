import { useNavigation } from "@remix-run/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { GetOneErrorBoundary } from "~/components/error-boundary"
import { parseIsNotFoundRecordError } from "@/error";
import { useLoaderData, useActionData, redirect } from "@remix-run/react";
import type { ActionFunctionArgs, LinksFunction } from "@remix-run/node";
import McpServerForm from "~/routes/world.$worldId.mcpServer/form"
import { z } from "zod";
import { getWorldMcpServer, updateWorldMcpServer } from "~/data/convexProxy/mcpServer.server"
import { listWorldTextures } from "~/data/convexProxy/texture.server"
import { listWorldLLMs } from "~/data/convexProxy/llm.server";
import { type McpServerId, table } from "@/world/mcpServer/schema";
import { type UpdateArgs } from "@/world/mcpServer/args";
import { MCPSERVER_TYPES } from "@/world/mcpServer/schema";
import { type TextureTable } from "@/world/textures";
import { type LLMTable } from "@/world/llms";
import { WorldId } from "@/worlds";
import formcssHref from "~/form.css?url";
import Toolbar from "~/components/toolbars/entity-save-toolbar";
import { Separator } from "~/components/ui/separator"
import { parseFormError } from "~/lib/error.server"
import { ServerErrors, ClientErrors } from "~/components/convex/type";
import { useState, useEffect } from 'react'
import { type ConvexComboxItem } from "~/components/ui/combox"
import { convertFormDataToObject } from "~/lib/form";
import { Handle } from "~/lib/routeHandle";
import { breadcrumb } from "~/components/app-breadcrumb";

export const handle: Handle = {
  breadcrumb
};

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: formcssHref },
];

const updateSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  url: z.string().min(1, { message: "url is required" }).url({ message: "website format" }),
  type: z.enum(MCPSERVER_TYPES, { message: "Type is required" }),
  desc: z.string(),
});

export async function action({
  request,
  params,
}: ActionFunctionArgs) {
  const { worldId, mcpServerId } = params;
  if (!worldId) {
    throw new Error("invalid world params!");
  }
  if (!mcpServerId) {
    throw new Error("invalid mcpServerId param!");
  }
  let serverErrors: ServerErrors = {}

  const formData = await request.formData();
  // const _formData = convertFormDataToObject(formData, { mergeNamePrefixsAsObject }, formatters);
  // if (typeof (_formData.functionDef as Record<string, any>).schema === 'string') {
  //   const schemaRawVal = (_formData.functionDef as Record<string, any>).schema as string
  //   (_formData.functionDef as Record<string, any>).schema = JSON5.parse(schemaRawVal)
  // }
  const _formData = convertFormDataToObject(formData);
  const formPayload = { ..._formData, id: mcpServerId as McpServerId, worldId }

  // payload z schema validation
  const result = updateSchema.safeParse(formPayload);
  if (result.success) {
    try {
      await updateWorldMcpServer(formPayload as UpdateArgs)
      return redirect(`/world/${worldId}/mcpServer/${mcpServerId}`)
    } catch (error) {
      // {field1: errorMessage, ...}
      const fields = Object.keys(updateSchema.keyof().Values)
      serverErrors = parseFormError(error, fields)
    }
  } else {
    // Handle validation errors
    serverErrors = { ...result.error.formErrors.fieldErrors }
  }

  return { serverErrors }
}

export async function loader({
  params,
}: LoaderFunctionArgs) {
  const { worldId, mcpServerId } = params;
  if (!worldId) {
    throw new Error("invalid world params!");
  }
  if (!mcpServerId) {
    throw new Error("invalid mcpServerId param!");
  }

  let mcpServer = null
  try {
    mcpServer = await getWorldMcpServer(mcpServerId as McpServerId)
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
    if (mcpServer === null) {
      throw new Response(null, {
        status: 404,
        statusText: "Not Found",
      });
    }
   
    const breadcrumbData = { routeName: `edit mcpServer (${mcpServer.name})`, routeUrl: `/world/${worldId}/mcpServer/${mcpServer._id}/edit` }

    return { ...breadcrumbData, mcpServer }
  }
}

export function ErrorBoundary() {
  return <GetOneErrorBoundary />
}


export default function EditMcpServer() {
  const { mcpServer } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [errors, setErrors] = useState(actionData?.serverErrors)

  useEffect(() => {
    if (actionData && "serverErrors" in actionData) {
      setErrors(actionData.serverErrors)
    }
  }, [actionData])

  function onClientErrors(clientErrors: ClientErrors) {
    // { ...actionData?.serverErrors, ...clientErrors }
    console.log('onClientErrors', clientErrors)
    setErrors(clientErrors)
  }

  const navigation = useNavigation();
  const isSubmitting = navigation.formMethod === "POST" && navigation.formAction === `/world/${mcpServer?.worldId}/mcpServer/${mcpServer?._id}/edit`;
  return (
    <div className="h-full">
      <McpServerForm
        errors={errors} onClientErrors={onClientErrors} doc={mcpServer} schema={updateSchema}>
        <Toolbar isSubmitting={isSubmitting} entityName={table} />
        <Separator />
      </McpServerForm>
    </div>
  )
}