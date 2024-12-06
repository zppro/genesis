import { Form } from "@remix-run/react";
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { FormErrorTip } from "~/components/form-error-tip"
import { type SceneDoc } from "@/world/scenes";
import { useToast } from "~/hooks/use-toast"
import { ScrollArea } from "~/components/ui/scroll-area"

export default function SceneForm({ children, errors, scene }: { children?: React.ReactNode, errors?: Record<string, any>, scene?: SceneDoc }) {
  const { toast } = useToast()
  if (errors?.["__err__"]) {
    toast({
      title: "create world error:",
      description: errors["__err__"],
    })
  }
  return (
    <Form method="post" className="flex flex-col h-full">
      {children}
      <ScrollArea className="h-full">
        <input name="worldId" type="hidden" value={scene?.worldId} />
        <div className="w-[350px] p-2">
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name<span className="text-red-500">*</span></Label>
              <Input id="name" name="name" defaultValue={scene?.name} placeholder="Name of your scene" className={errors?.name ? "form-input-err" : undefined} />
              {errors?.name ? <FormErrorTip tip={errors.name} /> : null}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" name="desc" defaultValue={scene?.desc} placeholder="Description of your scene" />
            </div>
          </div>
        </div>
      </ScrollArea>
    </Form>
  )
}