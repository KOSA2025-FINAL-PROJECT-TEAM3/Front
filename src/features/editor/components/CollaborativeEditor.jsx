import Collaboration from '@tiptap/extension-collaboration'
import Highlight from '@tiptap/extension-highlight'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { CharacterCount } from '@tiptap/extensions'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useCallback, useEffect, useState } from 'react'
import styles from './CollaborativeEditor.module.scss'

const COLORS = [
  '#958DF1', '#F98181', '#FBBC88', '#FAF594', '#70CFF8', '#94FADB',
  '#B9F18D', '#C3E2C2', '#EAECCC', '#AFC8AD', '#EEC759', '#9BB8CD',
  '#FF90BC', '#FFC0D9', '#DC8686', '#7ED7C1', '#F3EEEA', '#89B9AD',
  '#D0BFFF', '#FFF8C9', '#CBFFA9', '#9BABB8', '#E3F4F4',
]

const NAMES = [
  'Lea Thompson', 'Cyndi Lauper', 'Tom Cruise', 'Madonna', 'Jerry Hall',
  'Joan Collins', 'Winona Ryder', 'Christina Applegate', 'Alyssa Milano',
  'Molly Ringwald', 'Ally Sheedy', 'Debbie Harry', 'Olivia Newton-John',
  'Elton John', 'Michael J. Fox', 'Axl Rose', 'Emilio Estevez',
  'Ralph Macchio', 'Rob Lowe', 'Jennifer Grey', 'Mickey Rourke',
  'John Cusack', 'Matthew Broderick', 'Justine Bateman', 'Lisa Bonet',
]

const DEFAULT_CONTENT = `
  <p>Hi 👋, this is a collaborative document.</p>
  <p>Feel free to edit and collaborate in real-time!</p>
`

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)]
const getInitialUser = () => ({
  name: getRandomElement(NAMES),
  color: getRandomElement(COLORS),
})

const ToolbarButton = ({ cmd, editor }) => {
  const handleClick = useCallback(() => {
    switch (cmd) {
      case 'bold':
        editor.chain().focus().toggleBold().run()
        break
      case 'italic':
        editor.chain().focus().toggleItalic().run()
        break
      case 'strike':
        editor.chain().focus().toggleStrike().run()
        break
      case 'bulletList':
        editor.chain().focus().toggleBulletList().run()
        break
      case 'code':
        editor.chain().focus().toggleCode().run()
        break
      default:
        break
    }
  }, [editor, cmd])

  return (
    <button
      onClick={handleClick}
      className={editor.isActive(cmd) ? styles.activeButton : ''}
    >
      {cmd}
    </button>
  )
}

const CollaborativeEditor = ({ ydoc, provider, room }) => {
  const [status, setStatus] = useState('connecting')
  const [currentUser, setCurrentUser] = useState(getInitialUser)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ undoRedo: false }),
      Highlight,
      TaskList,
      TaskItem,
      CharacterCount.configure({ limit: 10000 }),
      Collaboration.configure({ document: ydoc, provider }),
    ],
    content: DEFAULT_CONTENT,
  })

  useEffect(() => {
    const handleStatus = (event) => setStatus(event.status)
    provider.on('status', handleStatus)
    return () => provider.off('status', handleStatus)
  }, [provider])

  const setName = useCallback(() => {
    const name = (window.prompt('Name', currentUser.name) || '').trim().substring(0, 32)
    if (name) setCurrentUser({ ...currentUser, name })
  }, [currentUser])

  if (!editor) return null

  return (
    <div className={styles.columnHalf}>
      <div className={styles.toolbar}>
        <div className={styles.buttonGroup}>
          {['bold', 'italic', 'strike', 'bulletList', 'code'].map((cmd) => (
            <ToolbarButton key={cmd} cmd={cmd} editor={editor} />
          ))}
        </div>
      </div>

      <EditorContent editor={editor} className={styles.editorSurface} />

      <div
        className={styles.collabStatus}
        data-state={status === 'connected' ? 'online' : 'offline'}
      >
        <label>
          {status === 'connected'
            ? `Connected to ${room}`
            : 'Offline'}
        </label>
        <button style={{ color: currentUser.color }} onClick={setName}>
          ✎ {currentUser.name}
        </button>
      </div>
    </div>
  )
}

export default CollaborativeEditor
