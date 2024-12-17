import JSON5 from 'json5'
import { memo } from 'react'

const PrettyPrintJson = memo(({ data }: { data?: string | object }) =>
(<pre className='bg-gray-600 text-gray-300 rounded'><code >{
  data && (
    typeof data === 'string' ?
      data
      :
      JSON5.stringify(data, null, 2)
  )
}</code></pre >));

export default PrettyPrintJson;
