export const convertFormDataToObject = (formData: FormData, opts?: { numberKeys?: string[], decimalKeys?: string[] }) => {
  return opts ? [...formData].reduce((o, [k, v]) => {
    if (opts.numberKeys?.includes(k)) {
      o[k] = parseInt(v as string) as unknown as FormDataEntryValue
    } else if (opts.decimalKeys?.includes(k)) {
      o[k] = parseFloat(v as string) as unknown as FormDataEntryValue
    } else {
      o[k] = v;
    }
    return o;
  }, {} as Record<string, FormDataEntryValue>)
    : Object.fromEntries(formData)
}