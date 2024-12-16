export const propertyFileMappings: Record<string, { accept: string; validFileTypes: string[]; }> = {
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