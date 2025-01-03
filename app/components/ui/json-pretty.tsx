import JSON5 from 'json5'
import { memo, useState } from 'react'
import { cn } from '~/lib/utils';
import { Copy, Check } from "lucide-react"
import copy from 'copy-to-clipboard';

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

export type PrettyPrintButtons = "copy"

function CopyButton({ copyText }: { copyText: string }) {
  const [isCopyed, setIsCopyed] = useState(false)

  return (
    <button onClick={(event) => {
      event.preventDefault();
      copy(copyText);
      setIsCopyed(true)
    }}>
      {isCopyed ? <Check className="h-4 w-4 text-muted-foreground" /> :
        <Copy className="h-4 w-4 text-muted-foreground hover:text-white hover:hand" />
      }

    </button>
  )
}

function InnerButtons({ children }: { children: React.ReactNode }) {
  return (
    <div className='absolute top-2 right-2'>
      {children}
    </div>
  )
}

const PrettyPrintJson = memo(({ className, data, buttons, ...props }
  : React.ComponentProps<"div"> & { data?: string | object, buttons?: PrettyPrintButtons[] }) => {
  if (!data) return null;
  const [isIn, setIsIn] = useState(false)
  return (
    <div onMouseEnter={() => {
      setIsIn(true)
    }} onMouseLeave={() => {
      setIsIn(false)
    }} className={cn('bg-gray-600 text-gray-300 rounded overflow-x-auto relative', className)} {...props}>
      <pre dangerouslySetInnerHTML={{
        __html: syntaxHighlight(
          typeof data === 'string' ?
            data
            :
            JSON5.stringify(data, null, 2)
        )
      }} >
      </pre >
      {buttons && isIn && <InnerButtons>
        {buttons.includes("copy") ? <CopyButton copyText={typeof data === "object" ? JSON5.stringify(data) : data} /> : null}
      </InnerButtons>
      }
    </div>
  )
}
);

export default PrettyPrintJson;
