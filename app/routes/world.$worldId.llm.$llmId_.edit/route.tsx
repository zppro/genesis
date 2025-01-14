import { useNavigation } from "@remix-run/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { GetOneErrorBoundary } from "~/components/error-boundary"
import { parseIsNotFoundRecordError } from "@/error";
import { useLoaderData, useActionData, redirect } from "@remix-run/react";
import type { ActionFunctionArgs, LinksFunction } from "@remix-run/node";
import LLMForm from "~/routes/world.$worldId.llm/form"
import { z } from "zod";
import { getWorldLLM, updateWorldLLM } from "~/data/convexProxy/llm.server"
import { type LLMId, type UpdateArgs, table } from "@/world/llms";
import formcssHref from "~/form.css?url";
import Toolbar from "~/components/toolbars/entity-save-toolbar";
import { Separator } from "~/components/ui/separator"
import { parseFormError } from "~/lib/error.server"
import { convertFormDataToObject } from "~/lib/form";
import { ServerErrors, ClientErrors } from "~/components/convex/type";
import { useState, useEffect } from "react";
import { Handle } from "~/lib/routeHandle";
import { breadcrumb } from "~/components/app-breadcrumb";

export const handle: Handle = {
  breadcrumb
};

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: formcssHref },
];

const updateSceneFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  desc: z.string(),
  apiKeyName: z.string().min(1, { message: "api key name is required" }),
  baseUrl: z.string().min(1, { message: "base url is required" }).url(),
});

export async function action({
  request,
  params,
}: ActionFunctionArgs) {
  const { worldId, llmId } = params;

  let serverErrors: ServerErrors = {}

  const formData = await request.formData();
  const _formData = convertFormDataToObject(formData);
  const formPayload = { ..._formData, id: llmId as LLMId }

  // payload z schema validation
  const result = updateSceneFormSchema.safeParse(formPayload);
  if (result.success) {
    try {
      await updateWorldLLM(formPayload as UpdateArgs)
      return redirect(`/world/${worldId}/llm/${llmId}`)
    } catch (error) {
      // {field1: errorMessage, ...}
      const fields = Object.keys(updateSceneFormSchema.keyof().Values)
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
  const { worldId, llmId } = params;
  let llm = null
  try {
    llm = await getWorldLLM(llmId as LLMId)
  } catch (error) {
    let isNotFoundError = parseIsNotFoundRecordError(error)
    if (isNotFoundError) {
      throw new Response(null, {
        status: 404,
        statusText: "Not Found",
      });
    }
    throw error
  }
  finally {
    if (llm === null) {
      throw new Response(null, {
        status: 404,
        statusText: "Not Found",
      });
    }
    const breadcrumbData = { routeName: `edit llm (${llm.name})`, routeUrl: `/world/${worldId}/llm/${llm._id}/edit` }

    return {...breadcrumbData, llm }
  }
}

export function ErrorBoundary() {
  return <GetOneErrorBoundary />
}


export default function EditScene() {
  const { llm } = useLoaderData<typeof loader>();
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
  const isSubmitting = navigation.formMethod === "POST" && navigation.formAction === `/world/${llm?.worldId}/llm/${llm?._id}/edit`;
  return (
    <div className="h-full">
      <LLMForm
        errors={errors}
        onClientErrors={onClientErrors}
        doc={llm!}
        schema={updateSceneFormSchema}
      >
        <Toolbar isSubmitting={isSubmitting} entityName={table} />
        <Separator />
      </LLMForm>
    </div>
  )
}