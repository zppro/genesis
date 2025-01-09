import { useToast } from "~/hooks/use-toast"
import { useNavigation } from "@remix-run/react";
import { useEffect } from "react";

export function useRedirectToast(actionCheck: string, desc?: string) {
  const { toast } = useToast()
  const navigation = useNavigation();
  useEffect(() => {
    if (
      navigation.state === "loading" &&
      navigation.formAction?.endsWith(actionCheck)
    ) {
      toast({
        title: "operation success",
        description: desc ? desc : `ok`,
      })

    }
  }, [navigation]);
  return navigation.state
}

export function useRedirectToastEx(method: string, actionCheck: string, desc?: string) {
  const navigation = useNavigation();
  const state = useRedirectToast(actionCheck, desc)
  return state === "submitting" && navigation.formMethod === method && navigation.formAction?.endsWith(actionCheck)
}