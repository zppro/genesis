import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent } from "~/components/ui/dialog"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useNavigate, useNavigation, useActionData, Form } from "@remix-run/react";
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { parseMutationArgumentErrorsToObject, parseConvexErrorToString } from "@/error";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/_generated/api";
import { ConvexError } from "convex/values";
import { redirect, type LinksFunction, ActionFunctionArgs } from "@remix-run/node";
import type { ClientActionFunctionArgs } from "@remix-run/react";
import { useAction } from "convex/react";
import { type InsertArgs, WORLD_TYPES } from "@/worlds"
import { useRootContext } from "~/hooks/use-context"
import { useLocalStorage } from "~/hooks/use-localStorage"
import { useToast } from "~/hooks/use-toast"
import { useState } from "react";
import { z } from "zod";
import { FormErrorTip } from "~/components/convex/form"
import formcssHref from "~/form.css?url";
import debounce from "debounce"
import { userPrefs } from "~/lib/cookies.server"
import { ServerErrors, ClientErrors } from "~/components/convex/type";
import { parseFormError } from "~/lib/error.server"
import { ConvexComboxProvider, type ConvexComboxItem } from "~/components/ui/combox"
import { convertFormDataToObject } from "~/lib/form";
import { createWorld } from "~/data/convexProxy/world.server"
import { useEffect, Suspense } from "react";
import { Skeleton } from "~/components/ui/skeleton";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: formcssHref },
];
const createSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  desc: z.string(),
  timeSpeedRatio: z.string().refine(v => v.match(/^\d+:\d+$/g)),
  type: z.enum(WORLD_TYPES),
});

export async function action({
  request,
}: ActionFunctionArgs) {

  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await userPrefs.parse(cookieHeader)) ?? {};

  let serverErrors: ServerErrors = {}
  const formData = await request.formData();
  const _formData = convertFormDataToObject(formData);
  const formPayload = { ..._formData }
  const result = createSchema.safeParse(formPayload);
  if (result.success) {
    try {
      const newWorldId = await createWorld(formPayload as unknown as InsertArgs)
      cookie.localWorldId = newWorldId;
      return redirect(`/world/${newWorldId}/scene`, {
        headers: {
          "Set-Cookie": await userPrefs.serialize(cookie),
        },
      })
    } catch (error) {
      // {field1: errorMessage, ...}
      const fields = Object.keys(createSchema.keyof().Values)
      serverErrors = parseFormError(error, fields)
    }
  } else {
    // Handle validation errors
    serverErrors = { ...result.error.formErrors.fieldErrors }
  }

  return { serverErrors };
}

export default function AddWorld() {
  console.log("begin to render")
  const navigate = useNavigate();
  const navigation = useNavigation();
  const { toast } = useToast()

  const actionData = useActionData<typeof action>();
  const [errors, setErrors] = useState(actionData?.serverErrors)

  useEffect(() => {
    if (actionData && "serverErrors" in actionData) {
      setErrors(actionData.serverErrors)
    }
  }, [actionData])

  useEffect(() => {
    if (errors?.["__err__"]) {
      toast({
        title: "create error:",
        description: errors["__err__"],
        variant: "destructive",
      })
    }
    return () => { }
  }, [errors?.["__err__"]])

  function onClientErrors(clientErrors: ClientErrors) {
    // { ...actionData?.serverErrors, ...clientErrors }
    setErrors(clientErrors)
  }

  function validateFormData(formData: FormData) {
    const formPayload = convertFormDataToObject(formData)
    // form number
    console.log('validateFormData=>', formPayload)
    const result = createSchema.safeParse(formPayload);
    return { ...result.error?.formErrors.fieldErrors }
  }
  const debouncedHandleChange = debounce((formData) => {
    onClientErrors(validateFormData(formData))
  }, 200);
  function handleChange(e: React.FormEvent<HTMLFormElement>) {
    debouncedHandleChange(new FormData(e.currentTarget));
  }
  const closeAndBack = () => navigate(-1);

  const isSubmitting = navigation.formAction === "/world/add";
  console.log("end to render")
  return (
    <Dialog open={true} onOpenChange={(isOpen) => {
      if (!isOpen) {
        closeAndBack()
      }
    }}>
      <DialogHeader>
        <VisuallyHidden.Root>
          <DialogTitle></DialogTitle>
          <DialogDescription/>
        </VisuallyHidden.Root>
      </DialogHeader>
      <DialogContent className={"lg:max-w-screen-lg overflow-y-scroll max-h-screen flex justify-center items-center"}>
        <Suspense fallback={<Skeleton className="w-[55rem] h-[44rem]" />}>
          <Form method="post" onChange={handleChange}>
            <Card className="w-[350px]">
              <CardHeader>
                <CardTitle>Create world</CardTitle>
                <CardDescription>create your new world in one-click.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="name">Name<span className="text-red-500">*</span></Label>
                    <Input id="name" name="name" placeholder="Name of your world" className={errors?.name ? "form-input-err" : undefined} />
                    {errors?.name ? <FormErrorTip tip={errors.name} /> : null}
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="timeSpeedRatio">TimeSpeedRatio<span className="text-red-500">*</span></Label>
                    <Input id="timeSpeedRatio" name="timeSpeedRatio" placeholder="realworld:gameworld i.e 1:1" defaultValue={"1:1"} className={errors?.timeSpeedRatio ? "form-input-err" : undefined} />
                    {errors?.timeSpeedRatio ? <FormErrorTip tip={errors.timeSpeedRatio} /> : null}
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="worldtype">WorldType</Label>
                    <Select name="type" defaultValue={WORLD_TYPES?.[0]}>
                      <SelectTrigger id="worldtype">
                        <SelectValue placeholder="Select World Type" />
                      </SelectTrigger>
                      <SelectContent position="popper" >
                        {WORLD_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="desc">Description</Label>
                    <Textarea id="desc" name="desc" placeholder="Description of your world" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={closeAndBack} >Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "saving..." : "create"}</Button>
              </CardFooter>
            </Card>
          </Form>
        </Suspense>

      </DialogContent>
    </Dialog>
  )
}