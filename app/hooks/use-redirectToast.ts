import { useToast } from "~/hooks/use-toast"
import { useNavigation } from "@remix-run/react";
import { useEffect } from "react";

export function useRedirectToast(actionCheck: string, desc?: string) {
  const { toast } = useToast()
  const navigation = useNavigation();
  useEffect(() => {
    if (
      navigation.state === "loading" &&
      navigation.formAction?.includes(actionCheck)
    ) {
      toast({
        title: "op success",
        description: desc ? desc : `${actionCheck} ok`,
      })

    }
  }, [navigation]);
  return navigation.state
}