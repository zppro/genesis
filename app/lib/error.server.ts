import { parseMutationArgumentErrorsToObject, parseConvexErrorToString } from "@/error";

export function parseFormError(error: any, fields: string[]) {
  let errors: Record<string, any> = {}
  let fieldErrors = parseMutationArgumentErrorsToObject(error)
  let errorMessage = ""
  if (!fieldErrors) {
    errorMessage = parseConvexErrorToString(error);
    errors = { "__err__": errorMessage }
  } else {
    const additionalFieldsError = []
    for (const key of Object.keys(fieldErrors)) {
      if (fields.includes(key)) {
        errors[key] = fieldErrors[key]
      } else {
        // 仍然可能存在包含额外字段的错误
        additionalFieldsError.push(fieldErrors[key])
      }
    }
    if (additionalFieldsError.length > 0) {
      errors["__err__"] = additionalFieldsError.join()
    }
  }
  return errors
}