export type FormDataEntryValueEx = FormDataEntryValue | string[]

export const convertFormDataToObject = (formData: FormData, opts?:
  { numberKeys?: string[], decimalKeys?: string[], mergeNamePrefixs?: string[] }
) => {
  return opts ? [...formData].reduce((o, [k, v]) => {
    if (opts.numberKeys?.includes(k)) {
      o[k] = parseInt(v as string) as unknown as FormDataEntryValue
    } else if (opts.decimalKeys?.includes(k)) {
      o[k] = parseFloat(v as string) as unknown as FormDataEntryValue
    } else if (opts.mergeNamePrefixs) {
      opts.mergeNamePrefixs.forEach(prefix => {
        if (k.startsWith(prefix + ".")) {
          if (!o[prefix]) {
            o[prefix] = [] as string[]
          }
          (o[prefix] as string[]).push(v as string)
        }
      })
    } else {
      o[k] = v;
    }
    return o;
  }, {} as Record<string, FormDataEntryValueEx>)
    : Object.fromEntries(formData)
}