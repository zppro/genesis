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
import { type CharacterDoc } from "@/world/characters";
import { api } from "@/_generated/api";
import { useMutation } from "convex/react";
import { calcFileSize, cn } from "~/lib/utils"
import { Upload, FileJson, FileAudio } from "lucide-react"

const characterPropertyFileMappings: Record<string, { accept: string; validFileTypes: string[]; }> = {
  "texture": {
    accept: "image/*",
    validFileTypes: [
      "image/jpeg",
      "image/jpg",
      "image/png",
    ]
  },
  "spritesheet": {
    accept: "application/json",
    validFileTypes: ["application/json"]
  },
}

export default function CharacterForm<T extends z.AnyZodObject>({ children, errors, character, schema }: { children?: React.ReactNode, errors?: Record<string, any>, character?: CharacterDoc, schema: T }) {
  const { toast } = useToast()
  const submit = useSubmit();
  // console.log('errors=>', errors)
  const [innerErrors, setInnerErrors] = useState(errors)

  const textureFileInput = useRef<HTMLInputElement>(null);
  const textureStorageIdInput = useRef<HTMLInputElement>(null);
  const spritesheetFileInput = useRef<HTMLInputElement>(null);
  const spritesheetStorageIdInput = useRef<HTMLInputElement>(null);

  const [selectedTextureFile, setSelectedTextureFile] = useState<File | null>(null);
  const [selectedSpritesheetFile, setSelectedSpritesheetFile] = useState<File | null>(null);
  const [previewTextureText, setPreviewTextureText] = useState("No files currently selected for textureUpload")
  const [previewSpritesheetText, setPreviewSpritesheetText] = useState("No files currently selected for spritesheetUpload")
  const generateUploadUrl = useMutation(api.shared.storage.generateUploadUrl);

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
        title: "save character error:",
        description: errors["__err__"],
        variant: "destructive",
      })
    }
    return () => { }
  }, [errors?.["__err__"]])

  function handleTextureFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      if (characterPropertyFileMappings["texture"].validFileTypes.includes(file.type)) {
        setPreviewTextureText(`${file.name}(${calcFileSize(
          file.size,
        )}).`);
      } else {
        setPreviewTextureText(`File name ${file.name}: Not a valid file type. Update your selection.`);
      }
      setSelectedTextureFile(file)
    }
  }

  function handleSpritesheetFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      if (characterPropertyFileMappings["spritesheet"].validFileTypes.includes(file.type)) {
        setPreviewSpritesheetText(`${file.name}(${calcFileSize(
          file.size,
        )}).`);
      } else {
        setPreviewSpritesheetText(`File name ${file.name}: Not a valid file type. Update your selection.`);
      }
      setSelectedSpritesheetFile(file)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    /// todo: file-size file-suffix can control and save to db
    const postUrl = await generateUploadUrl();
    const formData = new FormData(e.currentTarget);
    if (selectedTextureFile) {
      // Step 1: Get a short-lived upload URL

      // // Step 2: POST the file to the URL
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": selectedTextureFile.type },
        body: selectedTextureFile,
      });
      const { storageId } = await result.json();
      formData.append('textureStorageId', storageId);
      // // Step 3: Save the newly allocated storage id to the database
      textureStorageIdInput.current!.value = storageId
      setSelectedTextureFile(null);
      textureFileInput.current!.value = "";
    }
    if (!textureStorageIdInput.current!.value) {
      toast({
        title: "create character error:",
        description: "not set resource!!!",
        variant: "destructive",
      })
      setInnerErrors({ "__not_set_err__": "not set character!" })
      return
    }

    if (selectedSpritesheetFile) {
      // Step 1: Get a short-lived upload URL
      // const postUrl = await generateUploadUrl();
      // // Step 2: POST the file to the URL
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": selectedSpritesheetFile.type },
        body: selectedTextureFile,
      });
      const { storageId } = await result.json();
      formData.append('spritesheetStorageId', storageId);
      // // Step 3: Save the newly allocated storage id to the database
      spritesheetStorageIdInput.current!.value = storageId
      setSelectedSpritesheetFile(null);
      spritesheetFileInput.current!.value = "";
    }
    if (!spritesheetStorageIdInput.current!.value) {
      toast({
        title: "create character error:",
        description: "not set resource!!!",
        variant: "destructive",
      })
      setInnerErrors({ "__not_set_err__": "not set character!" })
      return
    }
    submit(formData, { method: "post" })
  }

  return (
    <Form method="post" onSubmit={handleSubmit} onChange={handleFormChange} className="flex flex-col h-full">
      {children}
      <ScrollArea className="h-full">
        <input name="textureStorageId" ref={textureStorageIdInput} type="hidden" defaultValue={character?.textureStorageId} />
        <input name="spritesheetStorageId" ref={spritesheetStorageIdInput} type="hidden" defaultValue={character?.spritesheetStorageId} />
        <div className="w-[350px] p-2">
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name<span className="text-red-500">*</span></Label>
              <Input id="name" name="name" defaultValue={character?.name} placeholder="Name of your character" className={innerErrors?.name ? "form-input-err" : undefined} />
              {innerErrors?.name ? <FormErrorTip tip={innerErrors.name} /> : null}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="speed">Speed</Label>
              <Input id="speed" name="speed" type="number" defaultValue={character?.speed} placeholder="Speed of your character" className={innerErrors?.name ? "form-input-err" : undefined} />
            </div>
            {character?.textureUrl ? <div className="flex flex-col space-y-1.5">
              <Label className="capitalize">Texture<span className="text-red-500">*</span></Label>
              <img src={character.textureUrl} className="resource-tileset" />
            </div> : null}
            <div>
              <Label htmlFor="textureUploader"
                className={cn("px-4 py-2 text-center rounded border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground inline-block", innerErrors?.["__not_set_err__"] ? "form-label-err" : "")}
              >
                <Upload className="h-4 w-4 inline-block mr-2" />
                to upload ({characterPropertyFileMappings["texture"].validFileTypes.map(vt => '.' + vt.split('/')[1].toUpperCase()).join(" ")})</Label>
              <input
                id="textureUploader"
                type="file"
                accept={characterPropertyFileMappings["texture"].accept}
                ref={textureFileInput}
                onChange={handleTextureFileInputChange}
                // disabled={selectedFile !== null}
                className="hidden"
              />
              <div className="py-2">
                <p>{previewTextureText}</p>
                {selectedTextureFile ? <img src={URL.createObjectURL(selectedTextureFile)} className="preview-resource-tileset" /> : null}

              </div>
            </div>
            {character?.spritesheetUrl ? <div className="flex flex-col space-y-1.5">
              <Label className="capitalize">Spritesheet<span className="text-red-500">*</span></Label>
              <a href={character.spritesheetUrl}><FileJson className="h-12 w-12" /></a>
            </div> : null}
            <div>
              <Label htmlFor="spritesheetUploader"
                className={cn("px-4 py-2 text-center rounded border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground inline-block", innerErrors?.["__not_set_err__"] ? "form-label-err" : "")}
              >
                <Upload className="h-4 w-4 inline-block mr-2" />
                to upload ({characterPropertyFileMappings["spritesheet"].validFileTypes.map(vt => '.' + vt.split('/')[1].toUpperCase()).join(" ")})</Label>
              <input
                id="spritesheetUploader"
                type="file"
                accept={characterPropertyFileMappings["spritesheet"].accept}
                ref={spritesheetFileInput}
                onChange={handleSpritesheetFileInputChange}
                // disabled={selectedFile !== null}
                className="hidden"
              />
              <div className="py-2">
                <p>{previewSpritesheetText}</p>

              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </Form>
  )
}