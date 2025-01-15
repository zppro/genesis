import { z } from "zod";
import { Doc, Id, TableNames } from "@/_generated/dataModel";
import { FormErrors, ConvexDocTables, ClientErrors } from "./type"
import { useEffect } from "react";
import { useToast } from "~/hooks/use-toast";

export function FormErrorTip({ tip }: { tip: string }) {
  return <span className="form-field-err-tip">{tip}</span>
}

export function FormInfoTip({ tip }: { tip: string }) {
  return <span className="form-field-info-tip">{tip}</span>
}

export type FormProps<T extends ConvexDocTables, S extends z.AnyZodObject> = {
  children?: React.ReactNode;
  errors?: FormErrors;
  doc?: Doc<T>;
  schema: S;
  onClientErrors: (clientErrors: ClientErrors) => void;
}

export type SlimFormProps<T extends ConvexDocTables> = {
  children?: React.ReactNode;
  errors?: FormErrors;
  doc?: Doc<T>;
}

export function useFormError(errors?: FormErrors, errKey: string = "__err__") {
  const { toast } = useToast()
  useEffect(() => {
    if (errors?.[errKey]) {
      toast({
        title: "form error:",
        description: errors[errKey],
        variant: "destructive",
      })
    }
    return () => { }
  }, [errors?.[errKey]])
}