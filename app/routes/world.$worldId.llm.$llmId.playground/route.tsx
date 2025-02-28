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
import { runLLM, runLLMWithFunctionCalling } from "~/data/convexProxy/llm.server";
import { RunLLMArgs, RunLLMWithFunctionCallingArgs } from "@/world/llmsAction";
import { Switch } from "~/components/ui/switch"

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: formcssHref },
];



const invokeLLMSchema = z.object({
  system: z.string().min(1, { message: "System is required" }),
  user: z.string().min(1, { message: "User is required" }),
  llmId: z.string(),
  worldId: z.string(),
});
const invokeLLMSchemaWithFunctionCalling = invokeLLMSchema.extend({
  funcName: z.string(),
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
  const withFunctionCalling = "funcName" in formPayload
  // payload z schema validation
  console.log("withFunctionCalling=>", withFunctionCalling)
  const result = withFunctionCalling ? invokeLLMSchemaWithFunctionCalling.safeParse(formPayload) : invokeLLMSchema.safeParse(formPayload);
  if (result.success) {
    try {
      if (withFunctionCalling) {
        const formPayload2 = {
          llmId: _formData["llmId"], worldId,
          messages: [
            { role: "system", content: _formData["system"] },
            { role: "user", content: _formData["user"] }
          ],
          funcName: _formData["funcName"] as unknown as string,
        }
        const res = await runLLMWithFunctionCalling(formPayload2 as RunLLMWithFunctionCallingArgs)
        console.log("runLLMWithFunctionCalling res=>", res)
        return { res }
      } else {
        const formPayload2 = {
          llmId: _formData["llmId"], worldId,
          messages: [
            { role: "system", content: _formData["system"] },
            { role: "user", content: _formData["user"] }
          ]
        }
        const res = await runLLM(formPayload2 as RunLLMArgs)
        return { res }
      }
    } catch (error) {
      console.log('runLLM err:', error)
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
  const [withFunctionCalling, setWithFunctionCalling] = useState(false);
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
  const systemDefaultVal = withFunctionCalling ? '你是一个会使用工具的助手，对于用户的输入首先就是先查找可用的工具' : 'You are a helpful assistant.';
  console.log('systemDefaultVal=>', systemDefaultVal)
  return (
    <Form method="post" onChange={handleChange} className="flex flex-col h-full">
      <input name="llmId" type="hidden" value={llm._id} />
      <div className="w-[480px] p-2 pl-4">
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="system">System</Label>
            <Textarea key={systemDefaultVal} id="system" name="system" defaultValue={systemDefaultVal} placeholder="You are a helpful assistent." className={errors?.system ? "form-input-err" : undefined} />
            {errors?.system ? <FormErrorTip tip={errors?.system} /> : null}
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="user">User</Label>
            <Textarea id="user" name="user" placeholder="Question" className={errors?.user ? "form-input-err" : undefined} />
            {errors?.user ? <FormErrorTip tip={errors?.user} /> : null}
          </div>
          <div className="flex flex-col space-y-1.5">
            <Switch id="withFunctionCalling" defaultChecked={withFunctionCalling} onCheckedChange={(v: boolean) => {
              setWithFunctionCalling(v);
            }} />
            <Label htmlFor="withFunctionCalling">with function calling</Label>
          </div>
          {
            withFunctionCalling &&
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="funcName">Function Name</Label>
              <Textarea id="funcName" name="funcName" defaultValue={"get_current_weather"} placeholder="the name of function to call" className={errors?.funcName ? "form-input-err" : undefined} />
              {errors?.funcName ? <FormErrorTip tip={errors?.funcName} /> : null}
            </div>
          }
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
              {actionData?.res && <MarkdownPretty data={actionData.res} className="w-[520px] min-h-[200px]" />}
            </div>
          </div>
        </ScrollArea>
      </div>
    </Form>
  )
}