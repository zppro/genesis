import { ConvexError } from "convex/values";
import { } from "convex/values"

export const parseConvexError = (error: any, failMsg: string = "Unexpected error occurred") => {
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

export const parseArgumentErrors = (error: any, failMsg: string = "Unexpected error occurred") => {
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