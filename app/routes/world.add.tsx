import {
  Dialog,
  DialogContent,
} from "~/components/ui/dialog"
import { useNavigate, useNavigation, Form } from "@remix-run/react";
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
import { redirect, type LinksFunction } from "@remix-run/node";
import type { ClientActionFunctionArgs } from "@remix-run/react";
import { useAction } from "convex/react";
import { type InsertArgs, WORLD_TYPES } from "@/worlds"
import { useRootContext } from "~/hooks/use-context"
import { useLocalStorage } from "~/hooks/use-localStorage"
import { useToast } from "~/hooks/use-toast"
import { useState } from "react";
import { z } from "zod";
import { FormErrorTip } from "~/components/form-error-tip"
import formcssHref from "~/form.css?url";
import debounce from "debounce"

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: formcssHref },
];
const createWorldFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  desc: z.string(),
  timeSpeedRatio: z.string().refine(v => v.match(/^\d+:\d+$/g)),
  type: z.enum(WORLD_TYPES),
});

export default function AddWorld() {
  const rootContext = useRootContext()
  console.log("world add rootContext=>", rootContext)
  const navigate = useNavigate();
  const navigation = useNavigation();
  const { toast } = useToast()
  const isSubmitting = navigation.formAction === "/world/add";
  const createFunc = useMutation(api.worlds.create)
  const [_, setLocalWorldId] = useLocalStorage("localWorldId", "")
  const [errors, setErrors] = useState<Record<string, any>>();

  const debouncedHandleChange = debounce((formData) => {
    const formPayload = Object.fromEntries(formData)
    // console.log('changed formPayload=>', formPayload)
    const result = createWorldFormSchema.safeParse(formPayload);
    setErrors(result.success ? {} : result.error.formErrors.fieldErrors)
  }, 200);

  function handleChange(e: React.FormEvent<HTMLFormElement>) {
    debouncedHandleChange(new FormData(e.currentTarget));
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let formData = new FormData(e.currentTarget);
    const formPayload = Object.fromEntries(formData)
    console.log('formPayload=>', formPayload)
    const result = createWorldFormSchema.safeParse(formPayload);
    if (result.success) {
      try {
        const newWorldId = await createFunc(formPayload as InsertArgs)
        console.log("newWorldId=>", newWorldId)
        typeof setLocalWorldId === 'function' && setLocalWorldId(newWorldId)
        navigate(`/world/${newWorldId}/dashboard`)
      } catch (error) {
        // {field1: errorMessage, ...}
        let fieldErrors = parseMutationArgumentErrorsToObject(error)
        let errorMessage = ""
        if (!fieldErrors) {
          errorMessage = parseConvexErrorToString(error);
        } else {
          setErrors(fieldErrors)
        }
        toast({
          title: "create world error:",
          description: errorMessage,
        })
      }
    } else {
      // Handle validation errors
      console.warn(result.error.formErrors.fieldErrors)
      setErrors(result.error.formErrors.fieldErrors);
    }

  }
  const closeAndBack = () => navigate(-1);
  return <Dialog open={true} onOpenChange={(isOpen) => {
    if (!isOpen) {
      closeAndBack()
    }
  }}>
    <DialogContent className={"lg:max-w-screen-lg overflow-y-scroll max-h-screen flex justify-center items-center"}>
      <Form method="post" onSubmit={handleSubmit} onChange={handleChange}>
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
            <Button type="submit">{isSubmitting ? "saving..." : "create"}</Button>
          </CardFooter>
        </Card>
      </Form>
    </DialogContent>
  </Dialog>
}