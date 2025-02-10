import { useNavigation, useLoaderData, useActionData, redirect } from "@remix-run/react";
import type { LoaderFunctionArgs, ActionFunctionArgs, LinksFunction } from "@remix-run/node";
import LLMForm from "~/routes/world.$worldId.llm/form"
import { z } from "zod";
import { createWorldLLM } from "~/data/convexProxy/llm.server"
import { type InsertArgs, table } from "@/world/llms";
import formcssHref from "~/form.css?url";
import Toolbar from "~/components/toolbars/entity-save-toolbar";
import { Separator } from "~/components/ui/separator"
import { parseFormError } from "~/lib/error.server"
import { ServerErrors, ClientErrors } from "~/components/convex/type";
import { type WorldId } from "@/worlds";
import { useState, useEffect, createElement } from "react";
import { convertFormDataToObject } from "~/lib/form";
import { Handle } from "~/lib/routeHandle";
import { breadcrumb } from "~/components/app-breadcrumb";

export const handle: Handle = {
  breadcrumb
};

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: formcssHref },
];
const createSceneFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  desc: z.string(),
  worldId: z.string(),
  provider: z.string().min(1, { message: "Provider is required" }),
  model: z.string().min(1, { message: "Model is required" }),
  apiKeyName: z.string().min(1, { message: "api key name is required" }),
  baseUrl: z.string().min(1, { message: "base url is required" }).url(),
});

export async function action({
  request,
  params,
}: ActionFunctionArgs) {
  const { worldId } = params;

  let serverErrors: ServerErrors = {}

  const formData = await request.formData();
  const _formData = convertFormDataToObject(formData);
  const formPayload = { ..._formData, worldId }

  // payload z schema validation
  const result = createSceneFormSchema.safeParse(formPayload);
  if (result.success) {
    try {
      const newLLMId = await createWorldLLM(formPayload as InsertArgs)
      // const newSceneId = ''
      return redirect(`/world/${worldId}/llm/${newLLMId}`)
    } catch (error) {
      // {field1: errorMessage, ...}
      const fields = Object.keys(createSceneFormSchema.keyof().Values)
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
    throw new Error("invalid params!");
  }
  const breadcrumbData = { routeName: "create new llm", routeUrl: `/world/${worldId}/llm/new` }

  return { ...breadcrumbData, worldId }
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
  const isSubmitting = navigation.formMethod === "POST" && navigation.formAction === `/world/${worldId}/llm/new`;

  function onClientErrors(clientErrors: ClientErrors) {
    // { ...actionData?.serverErrors, ...clientErrors }
    setErrors(clientErrors)
  }

  return (
    <div className="h-full">
      <LLMForm
        errors={errors}
        onClientErrors={onClientErrors}
        schema={createSceneFormSchema}
      >
        <Toolbar isSubmitting={isSubmitting} entityName={table} />
        <Separator />
      </LLMForm>
    </div>
  )
}