import { Form, useSubmit } from "@remix-run/react";
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { FormErrorTip } from "~/components/form-error-tip"
import { useToast } from "~/hooks/use-toast"
import { ScrollArea } from "~/components/ui/scroll-area"
import { useEffect, useState, useRef } from "react";
import { z } from "zod";
import debounce from "debounce"
import { type ResourceDoc, type ResourceTypes } from "@/world/resources";
import { api } from "@/_generated/api";
import { useMutation } from "convex/react";

export default function ResourceForm<T extends z.AnyZodObject>({ children, errors, resource, type, schema }: { children?: React.ReactNode, errors?: Record<string, any>, resource?: ResourceDoc, type: ResourceTypes, schema: T }) {
  const { toast } = useToast()
  const submit = useSubmit();
  // console.log('errors=>', errors)
  const [innerErrors, setInnerErrors] = useState(errors)

  const fileInput = useRef<HTMLInputElement>(null);
  const storageIdInput = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const generateUploadUrl = useMutation(api.world.resources.generateUploadUrl);

  // console.log('innerErrors=>', innerErrors)

  const debouncedHandleChange = debounce((formData) => {
    const formPayload = Object.fromEntries(formData)
    const result = schema.safeParse(formPayload);
    setInnerErrors(result.success ? undefined : { ...result.error.formErrors.fieldErrors })
  }, 200);

  function handleChange(e: React.FormEvent<HTMLFormElement>) {
    debouncedHandleChange(new FormData(e.currentTarget));
  }

  useEffect(() => {
    if (errors?.["__err__"]) {
      toast({
        title: "save resource error:",
        description: errors["__err__"],
        variant: "destructive",
      })
    }
    return () => { }
  }, [errors?.["__err__"]])

  async function handleSendFile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    /// todo: file-size file-suffix can control and save to db
    const formData = new FormData(e.currentTarget);
    if (selectedFile) {
      // Step 1: Get a short-lived upload URL
      const postUrl = await generateUploadUrl();
      // // Step 2: POST the file to the URL
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile!.type },
        body: selectedFile,
      });
      const { storageId } = await result.json();
      formData.append('storageId', storageId);
      // // Step 3: Save the newly allocated storage id to the database
      storageIdInput.current!.value = storageId
      setSelectedFile(null);
      fileInput.current!.value = "";
    }
    if (!storageIdInput.current!.value) {
      toast({
        title: "create resource error:",
        description: "not set resource!!!",
        variant: "destructive",
      })
      setInnerErrors({ "__resource__": "not set resource!" })
      return
    }
    submit(formData, { method: "post" })
  }

  return (
    <Form method="post" onSubmit={handleSendFile} onChange={handleChange} className="flex flex-col h-full">
      {children}
      <ScrollArea className="h-full">
        <input name="storageId" ref={storageIdInput} type="hidden" defaultValue={resource?.storageId} />
        <div className="w-[350px] p-2">
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name<span className="text-red-500">*</span></Label>
              <Input id="name" name="name" defaultValue={resource?.name} placeholder="Name of your scene" className={innerErrors?.name ? "form-input-err" : undefined} />
              {innerErrors?.name ? <FormErrorTip tip={innerErrors.name} /> : null}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name" className="capitalize">{type}<span className="text-red-500">*</span></Label>
              {resource?.url? (resource.type === "map"? <img src={resource.url} className="resource-map" />: null) : null}
              <input
                type="file"
                accept={type === "music" ? "audio/*" : "image/*"}
                ref={fileInput}
                onChange={(event) => setSelectedFile(event.target.files![0])}
                disabled={selectedFile !== null}
                className={innerErrors?.["__resource__"] ? "form-input-err" : undefined}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" name="desc" defaultValue={resource?.desc} placeholder="Description of your scene" />
            </div>
          </div>
        </div>
      </ScrollArea>
    </Form>
  )
}