import { ZodError } from "zod";

export function parseFormError(error: ZodError) {
  return error.issues.reduce((acc, v) => {
    acc[v.path.join(".")] = v.message
    return acc
  }, {} as Record<string, string>)
}