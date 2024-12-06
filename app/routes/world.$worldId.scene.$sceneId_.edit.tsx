import { useNavigate, useNavigation, Form } from "@remix-run/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
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
import { useToast } from "~/hooks/use-toast"
import { useState } from "react";
import { FormErrorTip } from "~/components/form-error-tip"
import formcssHref from "~/form.css?url";
import {useCurrentWorldContext} from "~/hooks/use-context";
import { getWorldScene } from "~/data/convexProxy/scene.server"
import { type SceneId } from "@/world/scenes";
import { GetOneErrorBoundary } from "~/components/error-boundary"
import { parseIsNotFoundRecordError } from "@/error";

export async function loader({
  params,
}: LoaderFunctionArgs) {
  const { sceneId } = params;
  console.log('edit sceneId=>', sceneId)
  try {
    const scene = await getWorldScene(sceneId as SceneId)
    return { scene }
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
}

export function ErrorBoundary() {
  return <GetOneErrorBoundary />
}


export default function SceneEdit() {
  console.log("in _.edit")
  const { currentWorldId } = useCurrentWorldContext()
  const navigate = useNavigate();
  const navigation = useNavigation();
  const { toast } = useToast()
  const isSubmitting = navigation.formAction === `/world/${currentWorldId}/scene`;
  const [errors, setErrors] = useState<Record<string, any>>();
  
  return (
    <Form method="post" >
      <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Create world scene</CardTitle>
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
                {/* <Select name="type" defaultValue={WORLD_TYPES?.[0]}>
                  <SelectTrigger id="worldtype">
                    <SelectValue placeholder="Select World Type" />
                  </SelectTrigger>
                  <SelectContent position="popper" >
                    {WORLD_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select> */}
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="desc">Description</Label>
                <Textarea id="desc" name="desc" placeholder="Description of your world" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" >Cancel</Button>
            <Button type="submit">{isSubmitting ? "saving..." : "create"}</Button>
          </CardFooter>
        </Card>
    </Form>
  )
}