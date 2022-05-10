const NotFound = undefined
type key = string

interface Routes<T> {
  parts: {
    [part: string]: Routes<T> | T
  }
  params: Params<T>
}

interface Params<T> {
  dict: {
    [key: string]: Routes<T> | T
  }
  arr: Array<[key, Routes<T> | T]>
}

function Routes<T>(): Routes<T> {
  return {
    parts: {},
    params: {
      dict: {},
      arr: [],
    },
  }
}

export interface RouteContext<T, P = any, Q = any> {
  value: T
  params: P
  search?: string
  hash?: string
}

export class Router<T> {
  private routes: Routes<T> = Routes()

  add(url: string, value: T) {
    const parts = url.split('/')
    const combinations = expandOptionalParams(parts)
    for (const parts of combinations) {
      let next = this.routes
      for (const part of parts) {
        next = getOrAddNextPart(next, part) as Routes<T>
      }
      next.parts[''] = value
    }
  }

  addDict(routes: { [url: string]: T }) {
    for (const entry of Object.entries(routes)) {
      this.add(entry[0], entry[1])
    }
  }

  // e.g. /search?client=firefox-b-d&q=url+with+hash+and+search+query#rhs
  route(url: string): RouteContext<T> | undefined {
    let path: string = url

    let hash: string | undefined
    if (path.includes('#')) {
      ; [path, hash] = path.split('#')
      hash = '#' + hash
    }

    let search: string | undefined
    if (path.includes('?')) {
      ; [path, search] = path.split('?')
    }

    const parts = path.split('/')

    const partsAcc = toList(parts)

    const match = matchParts(this.routes, partsAcc, null)
    if (!match) {
      return NotFound
    }
    return {
      value: match.value,
      params: toParams(match.paramsAcc),
      search,
      hash,
    }
  }
}

function getOrAddNextPart<T>(routes: Routes<T>, part: string): Routes<T> | T {
  if (part.startsWith(':')) {
    const key = part.substr(1)
    if (key in routes.params.dict) {
      return routes.params.dict[key]
    }
    const next = Routes<T>()
    routes.params.dict[key] = next
    routes.params.arr.push([key, next])
    return next
  }
  return routes.parts[part] || (routes.parts[part] = Routes())
}

type List<T> = [T, List<T> | null] | null

type ParamsAcc = List<[string, string]>

type PartsAcc = List<string>

function matchParts<T>(
  routes: Routes<T>,
  partsAcc: PartsAcc,
  paramsAcc: ParamsAcc,
):
  | {
      value: T
      paramsAcc: ParamsAcc | null
    }
  | undefined {
  if (!partsAcc) {
    if (!('' in routes.parts)) {
      return NotFound
    }
    return {
      value: routes.parts[''] as T,
      paramsAcc,
    }
  }
  const [part, parts] = partsAcc
  if (part in routes.parts) {
    return matchParts(routes.parts[part] as Routes<T>, parts, paramsAcc)
  }

  // apply deep-first search
  for (const [key, next] of routes.params.arr) {
    const match = matchParts(next as Routes<T>, parts, [[key, part], paramsAcc])
    if (match) {
      return match // return first matched route
    }
  }

  return NotFound
}

function toList<T>(array: T[]): List<T> {
  let acc: List<T> = null
  for (let i = array.length - 1; i >= 0; i--) {
    const element = array[i]
    acc = [element, acc]
  }
  return acc
}

function toParams(acc: ParamsAcc | null): Record<string, string> {
  const params: Record<string, string> = {}
  while (acc) {
    const [[key, value], next] = acc
    params[key] = value
    acc = next
  }
  return params
}

function expandOptionalParams(parts: string[]): string[][] {
  const combinations: string[][] = [parts]
  for (let i = parts.length - 1; i >= 0; i--) {
    let part = parts[i]
    if (part.endsWith('?')) {
      part = part.slice(0, part.length - 1)
      combinations.forEach(parts => (parts[i] = part))
      combinations.push(parts.slice(0, i))
    }
  }
  return combinations
}
