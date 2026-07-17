import { palierNote } from '../game/palier'

interface BadgeNoteProps {
  note: number
}

export default function BadgeNote({ note }: BadgeNoteProps) {
  return <span className={`badge-note badge-note-${palierNote(note)}`}>{note}</span>
}
