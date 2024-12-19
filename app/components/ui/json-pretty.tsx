import JSON5 from 'json5'
import { memo } from 'react'
import { cn } from '~/lib/utils';

export function syntaxHighlight(input: string) {
  input = input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return input.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    var cls = 'number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'key';
      } else {
        cls = 'string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'boolean';
    } else if (/null/.test(match)) {
      cls = 'null';
    }
    return '<span class="' + cls + '">' + match + '</span>';
  });
}

const PrettyPrintJson = memo(({ className, data, ...props }: React.ComponentProps<"pre"> & { data?: string | object }) =>
(data && <pre className={cn('bg-gray-600 text-gray-300 rounded overflow-x-auto', className)} {...props} dangerouslySetInnerHTML={{
  __html: syntaxHighlight(
    typeof data === 'string' ?
      data
      :
      JSON5.stringify(data, null, 2)
  )
}} >{
  }</pre >));

export default PrettyPrintJson;
