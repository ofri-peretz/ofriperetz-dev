/**
 * Idle-Until-Urgent Pattern Composable
 *
 * Based on Philip Walton's article: https://philipwalton.com/articles/idle-until-urgent/
 *
 * The problem with pure lazy loading is that it defers work until user interaction,
 * causing jank at the worst possible time. The problem with eager loading is that
 * it blocks initial render.
 *
 * Idle-until-urgent schedules work during idle time, but if the user needs the
 * result before the idle callback fires, it executes immediately.
 */

type IdleDeadline = {
  didTimeout: boolean
  timeRemaining: () => number
}

// Polyfill for requestIdleCallback
const requestIdleCallbackPolyfill = (cb: (deadline: IdleDeadline) => void, options?: { timeout?: number }) => {
  const start = Date.now()
  return window.setTimeout(() => {
    cb({
      didTimeout: options?.timeout ? Date.now() - start >= options.timeout : false,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
    })
  }, 1) as unknown as number
}

const cancelIdleCallbackPolyfill = (id: number) => {
  window.clearTimeout(id)
}

/**
 * Schedule a task to run during idle time, with urgency fallback
 */
export function useIdleCallback<T>(
  factory: () => T | Promise<T>,
  options: { timeout?: number } = {}
): { value: Ref<T | null>, ensure: () => Promise<T> } {
  const value = ref<T | null>(null) as Ref<T | null>
  let promise: Promise<T> | null = null
  let idleHandle: number | null = null
  let resolved = false

  const execute = async (): Promise<T> => {
    if (resolved && value.value !== null) {
      return value.value
    }

    if (promise) {
      return promise
    }

    promise = Promise.resolve(factory()).then((result) => {
      value.value = result
      resolved = true
      return result
    })

    return promise
  }

  // Cancel any pending idle callback
  const cancelIdle = () => {
    if (idleHandle !== null) {
      const cancelFn = typeof window !== 'undefined' && 'cancelIdleCallback' in window
        ? window.cancelIdleCallback
        : cancelIdleCallbackPolyfill
      cancelFn(idleHandle)
      idleHandle = null
    }
  }

  // Schedule during idle time (client-side only)
  if (import.meta.client) {
    const requestFn = typeof window !== 'undefined' && 'requestIdleCallback' in window
      ? window.requestIdleCallback
      : requestIdleCallbackPolyfill

    idleHandle = requestFn(() => {
      execute()
    }, { timeout: options.timeout || 2000 })
  }

  // Ensure function - if user needs the value NOW, execute immediately
  const ensure = async (): Promise<T> => {
    cancelIdle()
    return execute()
  }

  // Cleanup on unmount
  onUnmounted(() => {
    cancelIdle()
  })

  return { value, ensure }
}

/**
 * Prefetch a component during idle time
 * Returns a promise that resolves when the component is loaded
 */
export function useIdlePrefetch(
  componentImport: () => Promise<any>,
  options: { timeout?: number } = {}
): { loaded: Ref<boolean>, ensure: () => Promise<any> } {
  const { value, ensure } = useIdleCallback(componentImport, options)
  const loaded = computed(() => value.value !== null)

  return { loaded, ensure }
}

/**
 * Schedule multiple tasks to run during idle time in priority order
 */
export function useIdleQueue(
  tasks: Array<{ id: string, run: () => void | Promise<void>, priority?: number }>,
  options: { timeout?: number } = {}
): { completed: Ref<Set<string>>, ensureAll: () => Promise<void> } {
  const completed = ref(new Set<string>())
  const sortedTasks = [...tasks].sort((a, b) => (b.priority || 0) - (a.priority || 0))
  let currentIndex = 0

  const runNextTask = async () => {
    if (currentIndex >= sortedTasks.length) return

    const task = sortedTasks[currentIndex]
    currentIndex++

    try {
      await task.run()
      completed.value.add(task.id)
    } catch (e) {
      console.warn(`Idle task ${task.id} failed:`, e)
    }

    // Schedule next task
    if (import.meta.client && currentIndex < sortedTasks.length) {
      const requestFn = typeof window !== 'undefined' && 'requestIdleCallback' in window
        ? window.requestIdleCallback
        : requestIdleCallbackPolyfill

      requestFn(runNextTask, { timeout: options.timeout || 2000 })
    }
  }

  // Start the queue during idle time
  if (import.meta.client) {
    const requestFn = typeof window !== 'undefined' && 'requestIdleCallback' in window
      ? window.requestIdleCallback
      : requestIdleCallbackPolyfill

    requestFn(runNextTask, { timeout: options.timeout || 2000 })
  }

  const ensureAll = async () => {
    while (currentIndex < sortedTasks.length) {
      await runNextTask()
    }
  }

  return { completed, ensureAll }
}
