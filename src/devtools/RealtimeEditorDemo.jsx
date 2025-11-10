import '@components/Editor.scss'
import { HocuspocusProvider } from '@hocuspocus/provider'
import * as Y from 'yjs'
import EditorComponent from '@components/Editor.jsx'

const SERVER_URL = import.meta.env.VITE_HOCUSPOCUS_URL ?? 'ws://localhost:1234'

export function RealtimeEditorDemo() {
  const room = `room.${new Date().toISOString().slice(0, 10)}`

  const ydocA = new Y.Doc()
  const ydocB = new Y.Doc()
  const providerA = new HocuspocusProvider({
    url: SERVER_URL,
    name: room,
    document: ydocA,
  })
  const providerB = new HocuspocusProvider({
    url: SERVER_URL,
    name: room,
    document: ydocB,
  })

  return (
    <div className="col-group">
      <EditorComponent provider={providerA} ydoc={ydocA} room={room} />
      <EditorComponent provider={providerB} ydoc={ydocB} room={room} />
    </div>
  )
}

export default RealtimeEditorDemo
