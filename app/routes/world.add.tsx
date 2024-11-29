import {
  Dialog,
  DialogContent,
} from "~/components/ui/dialog"
import { useNavigate, useNavigation, Form } from "@remix-run/react";
import { Skeleton } from "~/components/ui/skeleton"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/_generated/api";
import { redirect, type ActionFunctionArgs } from "@remix-run/node";
import type { ClientActionFunctionArgs } from "@remix-run/react";
import { useAction } from "convex/react";
import type { InsertArgs } from "@/worlds"
import { useRootContext } from "~/hooks/use-context"
import { useLocalStorage } from "~/hooks/use-localStorage"
import { useToast } from "~/hooks/use-toast"

export default function AddWorld() {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const { toast } = useToast()
  const isSubmitting = navigation.formAction === "/world/add";
  const createFunc = useMutation(api.worlds.create)
  const [_, setLocalWorldId] = useLocalStorage("localWorldId", "")
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let formData = new FormData(e.currentTarget);
    const formPayload = Object.fromEntries(formData)
    console.log('formPayload=>', formPayload)
    try {
      const newWorldId = await createFunc(formPayload as InsertArgs)
      console.log("newWorldId=>", newWorldId)
      typeof setLocalWorldId === 'function' && setLocalWorldId(newWorldId)
      navigate(`/world/${newWorldId}/dashboard`)
    } catch (e) {
      toast({
        title: "create world error:",
        description: (e as Error).message,
      })
    }
  }
  const closeAndBack = () => navigate(-1);

  return <Dialog open={true} onOpenChange={(isOpen) => {
    if (!isOpen) {
      closeAndBack()
    }
  }}>
    <DialogContent className={"lg:max-w-screen-lg overflow-y-scroll max-h-screen flex justify-center items-center"}>
      <Form method="post" onSubmit={handleSubmit}>
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Create project</CardTitle>
            <CardDescription>Deploy your new project in one-click.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="Name of your project" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="framework">Framework</Label>
                <Select name="type">
                  <SelectTrigger id="framework">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="next">Next.js</SelectItem>
                    <SelectItem value="sveltekit">SvelteKit</SelectItem>
                    <SelectItem value="astro">Astro</SelectItem>
                    <SelectItem value="nuxt">Nuxt.js</SelectItem>
                  </SelectContent>
                </Select>
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