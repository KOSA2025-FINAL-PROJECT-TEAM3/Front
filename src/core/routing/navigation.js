let navigatorFn = null

export const setNavigator = (fn) => {
  navigatorFn = typeof fn === 'function' ? fn : null
}

export const navigateTo = (path, options) => {
  if (navigatorFn) {
    try {
      navigatorFn(path, options)
      return
    } catch {
      // fallback below
    }
  }
  if (typeof window !== 'undefined' && path) {
    // SPA 선호, 미등록 시 안전한 폴백
    if (options?.replace && window.history?.replaceState) {
      window.history.replaceState(null, '', path)
      window.dispatchEvent(new PopStateEvent('popstate'))
    } else {
      window.location.assign(path)
    }
  }
}

export default { setNavigator, navigateTo }

