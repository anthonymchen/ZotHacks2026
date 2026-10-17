import { useCallback, useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import ConfirmDialog from './ConfirmDialog'
import { WaveScene } from './Scenes'

export default function AppShell({ currentPage, onNavigate, onLogout, children }) {
  const [confirmingLogout, setConfirmingLogout] = useState(false)
  const cancelLogout = useCallback(() => setConfirmingLogout(false), [])

  // Start each page at the top instead of keeping the previous page's scroll.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [currentPage])

  return (
    <div className="app-shell">
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        onLogout={() => setConfirmingLogout(true)}
      />
      <div className="shell-main">{children}</div>
      <ConfirmDialog
        open={confirmingLogout}
        title="Log Out?"
        message="Are you sure you want to log out of your account?"
        confirmLabel="Log Out"
        illustration={<WaveScene text="Bye!" />}
        onCancel={cancelLogout}
        onConfirm={() => {
          setConfirmingLogout(false)
          onLogout()
        }}
      />
    </div>
  )
}
