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

export function useRedirectToast(actionMethod: string, actionCheck: string, desc?: string) {
  const { toast } = useToast()
  const navigation = useNavigation();
  useEffect(() => {
    console.log("actionCheck:", actionCheck)
    if (
      navigation.state === "loading" &&
      navigation.formMethod === actionMethod &&
      navigation.formAction?.endsWith(actionCheck)
    ) {
      console.log("navigation:", navigation.state, navigation.location, navigation.formMethod, navigation.formAction)
      if (!navigation.location) {
        return
      }
      const searchParams = new URLSearchParams(navigation.location.search)
      const _op = searchParams.get("_op")
      const _err = searchParams.get("_err")
      console.log('searchParams:', _op, _err)
      // const searchParams =  navigation.location.search
      if (_err) {
        toast({
          title: `operation(${_op}) failed`,
          description: _err,
          variant: "destructive",
        })
      } else {
        toast({
          title: `operation(${_op}) success`,
          description: desc ? desc : `ok`,
        })
      }
    }
  }, [navigation]);
  return navigation
}

export type RedirectAction = {
  method: Uppercase<FormMethod>;
  state?: "loading" | "idle" | "submitting";
  // actionCheck: string; // last paret is op
  desc?: string;
}

export function useRedirectToastEx(actions: RedirectAction[]) {
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

      // console.log('searchParams:', _err, _notifyUrl, _actionUrl)
      // console.log("navigation:", navigation.state, navigation.location, navigation.formMethod, navigation.formAction)
      // console.log("----method compare:", navigation.formMethod === redirectAction.method, navigation.formMethod, redirectAction.method)
      // console.log("----state compare:", navigation.state === redirectAction.state, navigation.state, redirectAction.state)
      // console.log("----location compare:", navigation.location?.pathname === `${_notifyUrl}`, navigation.location?.pathname, `${_notifyUrl}`)
      // console.log("----formAction compare:", navigation.formAction === `${_actionUrl}`, navigation.formAction, `${_actionUrl}`)

      if (
        navigation.formMethod === redirectAction.method &&
        navigation.state === (redirectAction.state ?? "loading") &&
        navigation.location?.pathname === `${_notifyUrl}` &&
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