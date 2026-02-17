import { useEffect } from 'react'
import { api } from '../lib/api'
import { getPendingFirs, markPendingSynced } from '../lib/db'

export function useOfflineSync() {
  useEffect(() => {
    async function syncPending() {
      if (!navigator.onLine) return
      try {
        const pending = await getPendingFirs()
        for (const p of pending) {
          const { complainant, incident } = p
          await api.createFir({ complainant, incident })
          await markPendingSynced(p.id)
        }
      } catch (e) {
        console.warn('Sync failed:', e)
      }
    }

    window.addEventListener('online', syncPending)
    syncPending()
    return () => window.removeEventListener('online', syncPending)
  }, [])
}
