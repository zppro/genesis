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
import { calcFileSize, cn } from "~/lib/utils"
import { Upload, FileJson, FileAudio } from "lucide-react"

const resourceTypeMappings: {
  [K in ResourceTypes]: { accept: string; validFileTypes: string[]; };
} = {
  "tileset": {
    accept: "image/*",
    validFileTypes: [
      "image/jpeg",
      "image/jpg",
      "image/png",
    ]
  },
  "tilemap": {
    accept: "application/json",
    validFileTypes: ["application/json"]
  },
  "item": {
    accept: "image/*",
    validFileTypes: [
      "image/jpeg",
      "image/jpg",
      "image/png",
    ],
  },
  "music": {
    accept: "audio/*",
    validFileTypes: [
      "audio/mp3",
      "audio/wav"
    ]
  }
}

export default function ResourceForm<T extends z.AnyZodObject>({ children, errors, resource, type, schema }: { children?: React.ReactNode, errors?: Record<string, any>, resource?: ResourceDoc, type: ResourceTypes, schema: T }) {
  const { toast } = useToast()
  const submit = useSubmit();
  // console.log('errors=>', errors)
  const [innerErrors, setInnerErrors] = useState(errors)

  const fileInput = useRef<HTMLInputElement>(null);
  const storageIdInput = useRef<HTMLInputElement>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewText, setPreviewText] = useState("No files currently selected for upload")
  const generateUploadUrl = useMutation(api.world.resources.generateUploadUrl);

  // console.log('innerErrors=>', innerErrors)

  const debouncedHandleChange = debounce((formData) => {
    const formPayload = Object.fromEntries(formData)
    const result = schema.safeParse(formPayload);
    setInnerErrors(result.success ? undefined : { ...result.error.formErrors.fieldErrors })
  }, 200);

  function handleFormChange(e: React.FormEvent<HTMLFormElement>) {
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

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      if (resourceTypeMappings[type].validFileTypes.includes(file.type)) {
        setPreviewText(`${file.name}(${calcFileSize(
          file.size,
        )}).`);
        if (!nameInput.current!.value) {
          nameInput.current!.value = file.name
        }
      } else {
        setPreviewText(`File name ${file.name}: Not a valid file type. Update your selection.`);
      }
      setSelectedFile(file)
    } else {

    }
  }

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
        headers: { "Content-Type": selectedFile.type },
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
    <Form method="post" onSubmit={handleSendFile} onChange={handleFormChange} className="flex flex-col h-full">
      {children}
      <ScrollArea className="h-full">
        <input name="storageId" ref={storageIdInput} type="hidden" defaultValue={resource?.storageId} />
        <div className="w-[350px] p-2">
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name<span className="text-red-500">*</span></Label>
              <Input id="name" ref={nameInput} name="name" defaultValue={resource?.name} placeholder="Name of your world" className={innerErrors?.name ? "form-input-err" : undefined} />
              {innerErrors?.name ? <FormErrorTip tip={innerErrors.name} /> : null}
            </div>
            {resource?.url ? <div className="flex flex-col space-y-1.5">
              <Label className="capitalize">{type}<span className="text-red-500">*</span></Label>
              {resource.type === "tileset" || resource.type === "item" ? <img src={resource.url} className="resource-tileset" /> : null}
              {resource.type === "tilemap" ? <a href={resource.url}><FileJson className="h-12 w-12" /></a> : null}
              {resource.type === "music" ? <a href={resource.url}><FileAudio className="h-12 w-12" /></a> : null}
            </div> : null}
            <div className="">
              <Label htmlFor="uploader"
                className={cn("px-4 py-2 text-center rounded border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground inline-block", innerErrors?.["__resource__"] ? "form-label-err" : "")}
              >
                <Upload className="h-4 w-4 inline-block mr-2" />
                to upload ({resourceTypeMappings[type].validFileTypes.map(vt => '.' + vt.split('/')[1].toUpperCase()).join(" ")})</Label>
              <input
                id="uploader"
                type="file"
                accept={resourceTypeMappings[type].accept}
                ref={fileInput}
                onChange={handleFileInputChange}
                // disabled={selectedFile !== null}
                className="hidden"
              />
              <div className="py-2">
                <p>{previewText}</p>
                {["tileset", "item"].includes(type) && selectedFile ? <img src={URL.createObjectURL(selectedFile)} className="preview-resource-tileset" /> : null}

              </div>
            </div>
            <div className="flex flex-col space-y-1.5">

            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" name="desc" defaultValue={resource?.desc} placeholder="Description of your world" />
            </div>
          </div>
        </div>
      </ScrollArea>
    </Form>
  )
}