import { useState } from 'react'

interface CopyProps {
  value: string
}

function Copy({ value }: CopyProps): JSX.Element {
  const [copied, setCopied] = useState(false)
  let timeoutId: NodeJS.Timeout | null = null

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => setCopied(false), 1000)
  }

  return (
    <span title='Copy' onClick={handleCopy} className='copy-widget' style={{ cursor: 'pointer' }}>
      {copied ? '✓' : '📋'}
    </span>
  )
}

export default Copy
