export default defineNuxtPlugin(async () => {
  if (!import.meta.dev || !('serviceWorker' in navigator)) {
    return
  }

  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  if (!isLocalhost) {
    return
  }

  const registrations = await navigator.serviceWorker.getRegistrations()
  if (registrations.length === 0) {
    return
  }

  await Promise.allSettled(registrations.map((registration) => registration.unregister()))

  if ('caches' in window) {
    const cacheKeys = await caches.keys()
    await Promise.allSettled(cacheKeys.map((key) => caches.delete(key)))
  }

  const reloadKey = 'arhmnsh-sw-reset'
  if (navigator.serviceWorker.controller && !sessionStorage.getItem(reloadKey)) {
    sessionStorage.setItem(reloadKey, '1')
    window.location.reload()
  }
})
