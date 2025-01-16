export type FormDataEntryValueEx = FormDataEntryValue | string[] | Record<string, any>
export type FormItemFormatter = {
  key: string; // a.b
  format: (v: FormDataEntryValue) => FormDataEntryValueEx;
}
export const convertFormDataToObject = (formData: FormData, opts?:
  {
    numberKeys?: string[],
    decimalKeys?: string[],
    mergeNamePrefixsAsArray?: string[],
    mergeNamePrefixsAsObject?: string[],
  },
  formatters?: FormItemFormatter[]
) => {
  return opts ? [...formData].reduce((o, [k, v]) => {
    let formatter = formatters?.find(f => f.key === k)
    if (opts.numberKeys?.includes(k)) {
      o[k] = formatter ? formatter.format(v) : parseInt(v as string) as unknown as FormDataEntryValue
    } else if (opts.decimalKeys?.includes(k)) {
      o[k] = formatter ? formatter.format(v) : parseFloat(v as string) as unknown as FormDataEntryValue
    } else if (opts.mergeNamePrefixsAsArray) {
      opts.mergeNamePrefixsAsArray.forEach(prefix => {
        if (k.startsWith(prefix + ".")) {
          formatter = formatters?.find(f => f.key === prefix)
          if (!o[prefix]) {
            o[prefix] = [] as string[]
          }
          const fv = (formatter ? formatter.format(v) : v) as string
          (o[prefix] as string[]).push(fv)
        } else {
          o[k] = formatter ? formatter.format(v) : v;
        }
      })
    } else if (opts.mergeNamePrefixsAsObject) {
      opts.mergeNamePrefixsAsObject.forEach(prefix => {
        if (k.startsWith(prefix + ".")) {
          formatter = formatters?.find(f => f.key === prefix)
          const subkey = k.substring(k.indexOf(".") + 1)
          if (!o[prefix]) {
            o[prefix] = {} as Record<string, any>
          }
          const fv = (formatter ? formatter.format(v) : v) as FormDataEntryValueEx
          (o[prefix] as Record<string, any>)[subkey] = fv
        } else {
          o[k] = formatter ? formatter.format(v) : v;
        }
      })
    } else {
      o[k] = formatter ? formatter.format(v) : v;
    }
    return o;
  }, {} as Record<string, FormDataEntryValueEx>)
    : Object.fromEntries(formData)
}