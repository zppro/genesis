import { ConvexError } from "convex/values";


export const parseConvexErrorToString = (error: any, failMsg: string = "Unexpected error occurred") => {
  console.log('error=>', error.message.length)

  console.log('error.cause=>', Object.keys(error))
  return error instanceof ConvexError // Check whether the error is an application error
    ? // Access data and cast it to the type we expect
    (error.data as { message: string }).message
    : // Must be some developer error,
    // and prod deployments will not
    // reveal any more information about it
    // to the client
    failMsg;
}

//去除换行 
const ClearBr = (key: string) => {
  key = key.replace(/<\/?.+?>/g, "");
  key = key.replace(/[\r\n]/g, "");
  return key;
}

export const parseIsNotFoundRecordError = (error: any) => {
  const regexp = /ArgumentValidationError:.*Path:\s*\.id/gm;

  return error instanceof Error && (error.message.includes("ArgumentValidationError:") && regexp.test(ClearBr(error.message)))
}

export const parseMutationArgumentErrorsToObject = (error: any, failMsg: string = "Unexpected error occurred") => {
  return (error instanceof Error && error.message.includes("ArgumentValidationError:") ? { [extractArgumentFields(error.message)]: extractValidateMsg(error.message) } : null);
}

const extractArgumentFields = (str: string) => {
  const regexp = /ArgumentValidationError:.*`(\S+)`\./gm;
  const array = [...str.matchAll(regexp)];
  return array.map(m => m[1]).join();
}

const extractValidateMsg = (str: string) => {
  const regexp = /ArgumentValidationError:((?!`\.).+)`\./gm;
  const array = [...str.matchAll(regexp)];
  return array.map(m => m[1]).join();
}