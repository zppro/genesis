import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { ScrollArea } from "~/components/ui/scroll-area"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { FormErrorTip } from "~/components/convex/form"
import { LoaderFunctionArgs, ActionFunctionArgs, LinksFunction } from "@remix-run/node";
import type { WorldId, SetDeployArgs } from "@/worlds";
import { getWorld, setWorldDeploy, listWorlds } from "~/data/convexProxy/world.server"
import { z } from "zod";
import { parseIsNotFoundRecordError } from "@/error";
import formcssHref from "~/form.css?url";
import Toolbar from "~/components/toolbars/entity-save-toolbar";
import { table } from "@/worlds";
import { Separator } from "~/components/ui/separator"
import { useRootContext } from "~/hooks/use-context"
import { useRef, useEffect, useState } from 'react'
import debounce from "debounce"
import { ServerErrors, ClientErrors } from "~/components/convex/type";
import { parseFormError } from "~/lib/error.server"
import { convertFormDataToObject } from "~/lib/form";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: formcssHref },
];

const setWorldDeploySchema = z.object({
  deploy: z.object({
    site: z.string().min(1, { message: "Site is required" }).url(),
  })
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
  const formPayload = { deploy: { ..._formData }, id: worldId as WorldId };
  console.log('formPayload=>', formPayload)
  // payload z schema validation
  const validateSchema = setWorldDeploySchema
  const result = validateSchema.safeParse(formPayload);
  if (result.success) {
    try {
      await setWorldDeploy(formPayload as SetDeployArgs)
      return {}
    } catch (error) {
      // {field1: errorMessage, ...}
      const fields = Object.keys(validateSchema.keyof().Values)
      serverErrors = parseFormError(error, fields)
    }
  } else {
    // Handle validation errors
    serverErrors = { ...result.error.formErrors.fieldErrors }
  }
  console.log("serverErrors=>", serverErrors)

  return { serverErrors }
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
  const [errors, setErrors] = useState(actionData?.serverErrors)
  const navigation = useNavigation();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (actionData) {
      if ("serverErrors" in actionData) {
        setErrors(actionData.serverErrors)
      }
    }
  }, [actionData])

  function onClientErrors(clientErrors: ClientErrors) {
    // { ...actionData?.serverErrors, ...clientErrors }
    setErrors(clientErrors)
  }
  function validateFormData(formData: FormData) {
    const _formData = convertFormDataToObject(formData);
    const formPayload = { deploy: { ..._formData } };
    // form number
    console.log('validateFormData=>', formPayload)
    const result = setWorldDeploySchema.safeParse(formPayload);
    return { ...result.error?.formErrors.fieldErrors }
  }
  const debouncedHandleChange = debounce((formData) => {
    onClientErrors(validateFormData(formData))
  }, 200);
  function handleChange(e: React.FormEvent<HTMLFormElement>) {
    console.log('handle change for submit')
    debouncedHandleChange(new FormData(e.currentTarget));
  }
  console.log("errors=>", errors)
  // const rootContext = useRootContext()
  // useEffect(()=> {
  //   if (actionData?.worlds) {
  //     rootContext.setWorlds(actionData.worlds)
  //   }
  // }, [actionData])
  const isSubmitting = navigation.formMethod === "PUT" && (navigation.formAction?.startsWith(`/world/${world._id}/settings/deploy`) ?? false);
  return (
    <Form method="put" ref={formRef} onChange={handleChange} className="flex flex-col h-full">
      <Toolbar entityName={table} isSubmitting={isSubmitting} />
      <Separator />
      <ScrollArea className="h-full">
        <div className="w-full p-2">
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="site">Site<span className="text-red-500">*</span></Label>
              <Input id="site" name="site" defaultValue={world?.deploy?.site} placeholder="Site of your world deploy" className={errors?.deploy?.[0] ? "form-input-err" : undefined} />
              {errors?.deploy?.[0] ? <FormErrorTip tip={errors?.deploy?.[0]} /> : null}
            </div>
          </div>
        </div>
      </ScrollArea>
    </Form>
  )
}