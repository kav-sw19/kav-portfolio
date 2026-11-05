// Storage that never throws. Some in-app browsers and "block all site data" settings make
// localStorage/sessionStorage throw a SecurityError on access, which would blank the whole app.

function wrap(get: () => Storage) {
  return {
    get(key: string): string | null {
      try {
        return get().getItem(key)
      } catch {
        return null
      }
    },
    set(key: string, value: string) {
      try {
        get().setItem(key, value)
      } catch {
        /* ignore */
      }
    },
    remove(key: string) {
      try {
        get().removeItem(key)
      } catch {
        /* ignore */
      }
    },
  }
}

export const local = wrap(() => window.localStorage)
export const session = wrap(() => window.sessionStorage)
