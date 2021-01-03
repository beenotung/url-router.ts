export function toQuery<T extends object>(search: string): T
export function toQuery<T extends object>(searchParams: URLSearchParams): T
export function toQuery<T extends object>(search: string | URLSearchParams): T {
  const searchParams: URLSearchParams =
    typeof search === 'string' ? new URLSearchParams(search) : search
  const query: any = {}
  searchParams.forEach((value, key) => {
    if (!(key in query)) {
      query[key] = value
      return
    }
    const oldValue = query[key]
    if (Array.isArray(oldValue)) {
      oldValue.push(value)
      return
    }
    query[key] = [oldValue, value]
  })
  return query
}
