import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useNavigation,
} from "@remix-run/react";

import { toastOnError } from "~/toasts"

export async function action({
  request,
}: ActionFunctionArgs) {
  const formData = await request.formData();
  // const errors = await validateRecipeFormData(formData);
  // if (errors) {
  //   return json({ errors });
  // }
  // const recipe = await db.recipes.create(formData);
  const worldId = 'a'
  return redirect(`/dashboard?world=${worldId}`);
}

export default function AddWorld() {
  const navigation = useNavigation();
  const isSubmitting = navigation.formAction === "/worlds/add";

  return (
    <Form method="post">
      <label>
        Name: <input name="name" />
      </label>
      <label>
        Desc: <textarea rows={3} name="desc" />
      </label>
      <button type="submit">
        {isSubmitting ? "保存中..." : "新增"}
      </button>
    </Form>
  )
}