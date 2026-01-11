export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:error', (error) => {
    // Check if the error is a ChunkLoadError (loading failed)
    if (
      error instanceof Error &&
      (error.name === 'ChunkLoadError' ||
       error.message.includes('Loading chunk') ||
       error.message.includes('Loading CSS chunk') || 
       error.message.includes('missing'))
    ) {
      console.warn('Chunk loading failed. Reloading page to fetch latest assets...', error)

      // Prevent infinite reload loops with a session storage flag
      const RELOAD_KEY = 'nuxt_chunk_reload_attempted'
      if (!sessionStorage.getItem(RELOAD_KEY)) {
        sessionStorage.setItem(RELOAD_KEY, 'true')
        window.location.reload()
      } else {
        console.error('Chunk reload retried but failed again. potential deployment issue.')
        // Clear flag after a delay so the user can eventually retry
        setTimeout(() => sessionStorage.removeItem(RELOAD_KEY), 60000)
      }
    }
  })

  // Global error handler for uncaught promise rejections (chunks often fail here)
  if (import.meta.client) {
    window.addEventListener('error', (event) => {
      if (
        event.message.includes('Loading chunk') ||
        event.message.includes('Loading CSS chunk')
      ) {
        const RELOAD_KEY = 'nuxt_chunk_reload_attempted'
        if (!sessionStorage.getItem(RELOAD_KEY)) {
          sessionStorage.setItem(RELOAD_KEY, 'true')
          window.location.reload()
        }
      }
    })
  }
})
