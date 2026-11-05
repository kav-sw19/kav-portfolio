import { useState } from 'react'

type Item = { name: string; icon: string; from: string; deleted: string; size: string; content: string }

const ITEMS: Item[] = [
  {
    name: 'cv_v1_FINAL_final2_USE_THIS_ONE.docx',
    icon: '📄',
    from: 'C:\\My Documents',
    deleted: '2022',
    size: '2.4 MB',
    content: `OBJECTIVE
To obtain a challenging position in a dynamic, fast-paced, synergistic environment where I can leverage my passion for leveraging.

SKILLS
Microsoft Word (advanced). Microsoft Word (expert). Typing.

REFERENCES
Available on request. Please don't request them.`,
  },
  {
    name: 'my_first_python_script.py',
    icon: '🐍',
    from: 'C:\\Projects\\old',
    deleted: '2020',
    size: '1 KB',
    content: `print("hello world")

# took 40 minutes.
# most of it was installing python.
# worth it.`,
  },
  {
    name: 'mongodb_pipeline_v0.js',
    icon: '📜',
    from: 'C:\\Work\\legacy',
    deleted: 'Oct 2026',
    size: '640 KB',
    content: `// replaced by medallion.
// it was 18x slower and 24% of its calls failed.
// rest in peace. you did your best.`,
  },
  {
    name: 'rewrite_in_rust.txt',
    icon: '🦀',
    from: 'C:\\Ideas',
    deleted: '2025',
    size: '1 KB',
    content: `TODO: rewrite everything in Rust.

status:
  [x] whosup
  [ ] everything else`,
  },
  {
    name: 'sleep_schedule.ics',
    icon: '📅',
    from: 'C:\\Calendar',
    deleted: 'Every week',
    size: '0 KB',
    content: 'No events found.',
  },
  {
    name: 'passwords.txt',
    icon: '🔒',
    from: 'C:\\Desktop',
    deleted: 'Immediately',
    size: '1 KB',
    content: 'nice try.\n\n(and if this had real passwords in it, deleting it to the Recycle Bin would not have been enough.)',
  },
  {
    name: 'node_modules',
    icon: '📁',
    from: 'C:\\Projects\\everything',
    deleted: 'Never fully',
    size: '1.2 GB',
    content: 'The heaviest object in the known universe.\n\n1,482 packages. 3 of them are left-pad.',
  },
]

type Dialog = { title: string; text: string; confirm?: () => void } | null

export default function RecycleBin() {
  const [sel, setSel] = useState<number | null>(null)
  const [open, setOpen] = useState<number | null>(null)
  const [dialog, setDialog] = useState<Dialog>(null)

  const item = sel != null ? ITEMS[sel] : null

  const empty = () =>
    setDialog({
      title: 'Confirm Multiple File Delete',
      text: `Are you sure you want to permanently delete these ${ITEMS.length} items?\n\n(these are my memories.)`,
      confirm: () => setDialog({ title: 'Error Deleting File', text: 'Cannot delete: items have sentimental value.' }),
    })

  const restore = () =>
    item && setDialog({ title: 'Error Restoring File', text: `Cannot restore '${item.name}'.\n\nSome things are better left in the bin.` })

  return (
    <div className="rb">
      <div className="rb-toolbar" role="toolbar" aria-label="Recycle Bin">
        <button type="button" className="w95-btn" onClick={empty}>
          <span aria-hidden>🗑️</span> Empty Recycle Bin
        </button>
        <button type="button" className="w95-btn" onClick={restore} disabled={!item}>
          <span aria-hidden>♻️</span> Restore
        </button>
        <button type="button" className="w95-btn" onClick={() => sel != null && setOpen(sel)} disabled={!item}>
          <span aria-hidden>👁️</span> Open
        </button>
      </div>

      <div className="rb-list w95-sunken" role="listbox" aria-label="Deleted items">
        <div className="rb-row rb-head" aria-hidden>
          <span>Name</span>
          <span>Original Location</span>
          <span>Date Deleted</span>
          <span>Size</span>
        </div>
        {ITEMS.map((it, i) => (
          <button
            key={it.name}
            type="button"
            role="option"
            aria-selected={sel === i}
            className={`rb-row${sel === i ? ' is-sel' : ''}`}
            onClick={() => setSel(i)}
            onDoubleClick={() => setOpen(i)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), setOpen(i))}
          >
            <span className="rb-name">
              <span aria-hidden>{it.icon}</span> {it.name}
            </span>
            <span>{it.from}</span>
            <span>{it.deleted}</span>
            <span>{it.size}</span>
          </button>
        ))}
      </div>

      {open != null && (
        <div className="rb-preview w95-sunken" aria-live="polite">
          <div className="rb-preview-head">
            <b>{ITEMS[open].name}</b>
            <button type="button" className="w95-btn w95-tb" aria-label="Close preview" onClick={() => setOpen(null)}>
              <svg viewBox="0 0 8 7" aria-hidden>
                <path d="M0 0h2l2 2 2-2h2L5 3.5 8 7H6L4 5 2 7H0l3-3.5z" />
              </svg>
            </button>
          </div>
          <pre>{ITEMS[open].content}</pre>
        </div>
      )}

      <div className="rb-status" aria-hidden>
        {ITEMS.length} object(s) · 1.2 GB (mostly node_modules)
      </div>

      {dialog && (
        <div className="w95-modal-scrim">
          <div className="w95-modal w95-raised" role="alertdialog" aria-modal="true" aria-labelledby="rb-dlg-title" aria-describedby="rb-dlg-text">
            <div className="w95-titlebar w95-modal-title">
              <span id="rb-dlg-title" className="w95-title">
                {dialog.title}
              </span>
            </div>
            <div className="w95-modal-body">
              <span className="w95-modal-icon" aria-hidden>
                {dialog.confirm ? '⚠️' : '❌'}
              </span>
              <p id="rb-dlg-text">{dialog.text}</p>
            </div>
            <div className="w95-modal-btns">
              {dialog.confirm ? (
                <>
                  <button type="button" className="w95-btn" onClick={dialog.confirm} autoFocus>
                    Yes
                  </button>
                  <button type="button" className="w95-btn" onClick={() => setDialog(null)}>
                    No
                  </button>
                </>
              ) : (
                <button type="button" className="w95-btn" onClick={() => setDialog(null)} autoFocus>
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
