import { useToast } from "~/hooks/use-toast"
import { useNavigation, useLocation, FormMethod } from "@remix-run/react";

import { useEffect } from "react";
import { action } from "~/routes/world";


export function useRedirectToastOld(actionCheck: string, desc?: string) {
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

export function useRedirectToastExOld(method: string, actionCheck: string, desc?: string) {
  const navigation = useNavigation();
  const state = useRedirectToastOld(actionCheck, desc)
  return state === "submitting" && navigation.formMethod === method && navigation.formAction?.endsWith(actionCheck)
}

export type RedirectAction = {
  method: Uppercase<FormMethod>;
  state?: "loading" | "idle" | "submitting";
  actionCheck: string; // last paret is op
  desc?: string;
}

export function useRedirectToast(actions: RedirectAction[]) {
  const { toast } = useToast()
  const navigation = useNavigation();
  useEffect(() => {
    actions.map(redirectAction => {
      if (!navigation.location) {
        return
      }
      const searchParams = new URLSearchParams(navigation.location.search)
      const _err = searchParams.get("_err")
      const _notifyUrl = searchParams.get("_notifyUrl")
      const _actionUrl = searchParams.get("_actionUrl")
      const redirectActionState = (redirectAction.state ?? "loading")

      // console.log('searchParams:', _err, _notifyUrl, _actionUrl)
      // console.log("navigation:", navigation.state, navigation.location, navigation.formMethod, navigation.formAction)
      // console.log("----method compare:", navigation.formMethod === redirectAction.method, navigation.formMethod, redirectAction.method)
      // console.log("----state compare:", navigation.state === redirectActionState, navigation.state, redirectActionState)
      // console.log("----location compare:", navigation.location?.pathname === `${_notifyUrl}`, navigation.location?.pathname, `${_notifyUrl}`)
      // console.log("----actionCheck compare:", _actionUrl?.endsWith(redirectAction.actionCheck), _actionUrl, redirectAction.actionCheck)
      // console.log("----formAction compare:", navigation.formAction === `${_actionUrl}`, navigation.formAction, `${_actionUrl}`)

      if (
        navigation.formMethod === redirectAction.method &&
        navigation.state === redirectActionState &&
        navigation.location?.pathname === `${_notifyUrl}` &&
        _actionUrl?.endsWith(redirectAction.actionCheck) &&
        navigation.formAction === `${_actionUrl}`
      ) {
        let op = navigation.formAction.slice(navigation.formAction.lastIndexOf("/") + 1, navigation.formAction.length);

        // const searchParams =  navigation.location.search
        if (_err) {
          toast({
            title: `operation(${op}) failed`,
            description: _err,
            variant: "destructive",
          })
        } else {
          toast({
            title: `operation(${op}) success`,
            description: redirectAction.desc ? redirectAction.desc : `ok`,
          })
        }
      }
    })

  }, [navigation]);
  return navigation
}