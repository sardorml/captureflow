import { useEffect } from 'react'
import { RecordingToolbar } from './components/recording/RecordingToolbar'
import { SelectionOverlay } from './components/recording/SelectionOverlay'
import { PermissionsWindow } from './components/permissions/PermissionsWindow'
import { WebcamBubble } from './components/recording/WebcamBubble'
import { SnapNotification } from './components/recording/SnapNotification'

function App(): React.JSX.Element {
  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if (e.key === 'Tab') e.preventDefault()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const hash = window.location.hash
  if (hash === '#/selection-overlay') {
    return <SelectionOverlay />
  }
  if (hash === '#/permissions') {
    return <PermissionsWindow />
  }
  if (hash === '#/webcam-bubble') {
    return <WebcamBubble />
  }
  if (hash === '#/snap-notification') {
    return <SnapNotification />
  }

  return <RecordingToolbar />
}

export default App
