import * as React from "react"

export function useMediaQuery(query: string) {
  const [value, setValue] = React.useState(false)

  React.useEffect(() => {
    // Kiểm tra xem matchMedia có tồn tại không (chỉ tồn tại ở client-side)
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }

    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches)
    }

    const result = window.matchMedia(query)
    result.addEventListener("change", onChange)
    setValue(result.matches)

    return () => result.removeEventListener("change", onChange)
  }, [query])

  return value
}
