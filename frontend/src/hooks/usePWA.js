import { useRegisterSW } from 'virtual:pwa-register/react'

export function usePWA() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r)
    },
    onRegisterError(error) {
      console.error('SW registration error', error)
    },
  })

  return {
    offlineReady,
    needRefresh,
    updateServiceWorker,
    close: () => {
      setOfflineReady(false)
      setNeedRefresh(false)
    }
  }
}
