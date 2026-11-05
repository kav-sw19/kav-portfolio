import type { ReactNode } from 'react'

export type AppId =
  | 'about'
  | 'experience'
  | 'projects'
  | 'skills'
  | 'contact'
  | 'terminal'
  | 'minesweeper'
  | 'readme'
  | 'education'
  | 'outlook'
  | 'recycle'
  | 'guestbook'

export type AppDef = {
  id: AppId
  title: string
  icon: string // emoji / glyph for now
  w: number
  h: number
  render: (api: WinApi) => ReactNode
}

export type WinApi = {
  open: (id: AppId) => void
  close: () => void
}

export type Win = {
  key: number
  app: AppId
  x: number
  y: number
  w: number
  h: number
  z: number
  min: boolean
  max: boolean
}
