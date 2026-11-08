import axios from "axios"
import { useEffect, useState } from "react"
import { api } from "@/infra/api"

export function useFetchData<T>(url: string) {
  const [data, setData] = useState<T>()
  const [error, setError] = useState<string>()
  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      try {
        setData((await api.get<T>(url, { signal: controller.signal })).data)
      } catch (err) {
        if (axios.isCancel(err)) return
        setError(axios.isAxiosError<{ error?: string }>(err) ? (err.response?.data?.error ?? err.message) : "Something went wrong")
      }
    }
    load()
    return () => controller.abort()
  }, [url])
  return { data, error, loading: !data && !error }
}
