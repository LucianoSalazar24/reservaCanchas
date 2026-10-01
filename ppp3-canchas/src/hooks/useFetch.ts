import { useState, useEffect } from 'react'

interface UseFetchResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  setData: React.Dispatch<React.SetStateAction<T | null>>
  recargar: () => void
}

export function useFetch<T>(
  fetcher: () => Promise<T>,
  key: string = ''
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [trigger, setTrigger] = useState(0)

  const recargar = () => setTrigger(t => t + 1)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetcher()
      .then(result => { if (!cancelled) setData(result) })
      .catch(err => { if (!cancelled) setError((err as Error).message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [key, trigger]) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, setData, recargar }
}
