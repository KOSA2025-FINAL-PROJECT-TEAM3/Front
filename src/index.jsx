import './components/Editor.scss'

//셀프호스트
import { HocuspocusProvider } from '@hocuspocus/provider'
import * as Y from 'yjs'

import EditorComponent from './components/Editor.jsx'

// self-host 서버 주소로 변경 => 호스팅 되고있는 hocuspocus 주소로 변경 필요 => localhost시 컴퓨터 localhost
const SERVER_URL = 'ws://192.168.2.45:1234'
const room = `room.${new Date().toISOString().slice(0, 10)}`

// ydoc and provider for Editor A
const ydocA = new Y.Doc()
const providerA = new HocuspocusProvider({
  url: SERVER_URL, // ✅ 내 Hocuspocus 서버 WebSocket 주소
  name: room,
  document: ydocA,
})

// ydoc and provider for Editor B
const ydocB = new Y.Doc()
const providerB = new HocuspocusProvider({
  url: SERVER_URL, // ✅ 동일한 방 이름, 동일 서버
  name: room,
  document: ydocB,
})

const App = () => {
  return (
    <div className="col-group">
      <EditorComponent provider={providerA} ydoc={ydocA} room={room} />
      <EditorComponent provider={providerB} ydoc={ydocB} room={room} />
    </div>
  )
}

export default App
