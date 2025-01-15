import { useLoaderData, useNavigation, useRouteLoaderData, useActionData } from "@remix-run/react";
import { type LoaderFunctionArgs, LinksFunction, ActionFunctionArgs } from "@remix-run/node";
import { GetOneErrorBoundary } from "~/components/error-boundary"
import { Textarea } from "~/components/ui/textarea"
import { Label } from "~/components/ui/label"
import { Form } from "@remix-run/react";
import type { loader as llmLoader } from "~/routes/world.$worldId.llm.$llmId/route";
import { Handle } from "~/lib/routeHandle";
import { breadcrumb } from "~/components/app-breadcrumb";
import { parseFormError } from "~/lib/error.server"
import { ServerErrors, ClientErrors } from "~/components/convex/type";
import { useFormError, FormErrorTip } from "~/components/convex/form";
import debounce from "debounce"
import { convertFormDataToObject } from "~/lib/form";
import formcssHref from "~/form.css?url";
import { z } from "zod";
import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button"
import { Separator } from "~/components/ui/separator"
import { Play } from "lucide-react"
import { ScrollArea } from "~/components/ui/scroll-area"
import MarkdownPretty from "~/components/ui/markdown-pretty.client";
import { runLLM } from "~/data/convexProxy/llm.server";
import { RunLLMArgs } from "@/world/llmsAction";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: formcssHref },
];
const invokeLLMSchema = z.object({
  system: z.string().min(1, { message: "System is required" }),
  user: z.string().min(1, { message: "User is required" }),
  llmId: z.string(),
  worldId: z.string(),
});

export const handle: Handle = {
  breadcrumb
};

export function ErrorBoundary() {
  return <GetOneErrorBoundary />
}


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
  const result = invokeLLMSchema.safeParse(formPayload);
  if (result.success) {
    try {
      const res = await runLLM(formPayload as RunLLMArgs)
      return { res }
    } catch (error) {
      // {field1: errorMessage, ...}
      const fields = Object.keys(invokeLLMSchema.keyof().Values)
      serverErrors = parseFormError(error, fields)
    }
  } else {
    // Handle validation errors
    serverErrors = { ...result.error.formErrors.fieldErrors }
  }
  console.log("serverErrors:", serverErrors)
  return { serverErrors }
}

export async function loader({
  params,
  request,
}: LoaderFunctionArgs) {
  const breadcrumbData = { routeName: "playground", routeUrl: "#" }
  return { ...breadcrumbData }
}

export default function PlaygroundTab() {
  const { llm } = useRouteLoaderData<typeof llmLoader>("routes/world.$worldId.llm.$llmId")!;
  const actionData = useActionData<typeof action>();
  const [errors, setErrors] = useState(actionData?.serverErrors)
  useEffect(() => {
    if (actionData && "serverErrors" in actionData) {
      setErrors(actionData.serverErrors)
    }
  }, [actionData])
  function validateFormData(formData: FormData) {
    const formPayload = convertFormDataToObject(formData)
    // form number
    console.log('validateFormData=>', formPayload)
    const result = invokeLLMSchema.safeParse(formPayload);
    return { ...result.error?.formErrors.fieldErrors }
  }

  const debouncedHandleChange = debounce((formData) => {
    setErrors(validateFormData(formData))
  }, 200);
  function handleChange(e: React.FormEvent<HTMLFormElement>) {
    debouncedHandleChange(new FormData(e.currentTarget));
  }
  useFormError(errors)

  const navigation = useNavigation();
  const isSubmitting = navigation.formMethod === "POST" && navigation.formAction === `/world/${llm.worldId}/llm/${llm._id}/playground`;

  return (
    <Form method="post" onChange={handleChange} className="flex flex-col h-full">
      <input name="llmId" type="hidden" value={llm._id} />
      <div className="w-[480px] p-2 pl-4">
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="system">System</Label>
            <Textarea id="system" name="system" defaultValue={"You are a helpful assistant."} placeholder="You are a helpful assistent." className={errors?.system ? "form-input-err" : undefined} />
            {errors?.system ? <FormErrorTip tip={errors?.system} /> : null}
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="user">User</Label>
            <Textarea id="user" name="user" placeholder="Question" className={errors?.user ? "form-input-err" : undefined} />
            {errors?.user ? <FormErrorTip tip={errors?.user} /> : null}
          </div>
          <div className="flex flex-col space-y-1.5">
            <Button variant="ghost" className="border" type="submit" disabled={isSubmitting} >
              <Play className="h-4 w-4" />
              <span >{isSubmitting ? "Invoking..." : "Invoke"}</span>
            </Button>
          </div>
        </div>
        <Separator className="mt-4" />
        <ScrollArea className="p-4 h-full w-full max-h-[calc(100vh-500px)]">
          <div className="flex flex-col space-y-2">
            <div className="whitespace-pre-wrap">
              <MarkdownPretty data={actionData?.res} className="w-[520px] min-h-[200px]"  />
              </div>
          </div>
        </ScrollArea>
      </div>
    </Form>
  )
}