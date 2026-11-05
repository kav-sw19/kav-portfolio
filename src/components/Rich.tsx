import { Fragment } from 'react'

/** Renders profile text where **double asterisks** mark emphasis (the CV's \textbf phrases). */
export default function Rich({ text, as: Strong = 'strong' }: { text: string; as?: 'strong' | 'b' }) {
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return (
    <>
      {parts.map((p, i) => (i % 2 ? <Strong key={i}>{p}</Strong> : <Fragment key={i}>{p}</Fragment>))}
    </>
  )
}

/** The same text with the emphasis markers removed (for plain-text contexts). */
export const unrich = (text: string) => text.replace(/\*\*(.+?)\*\*/g, '$1')
