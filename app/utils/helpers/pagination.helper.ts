// check query params for size it must be between 25 and 100 and page must be at least 1
const clampPageSize = (size: number, min: number = 25, max: number = 100) => {
  if (!Number.isFinite(size)) return min
  if (size < min) return min
  if (size > max) return max
  return Math.floor(size)
}

// ensure page is at least 1
const sanitizePage = (page: number) => {
  if (!Number.isFinite(page) || page < 1) return 1
  return Math.floor(page)
}

type CanonicalDefaults = {
  defaultSize?: number
  defaultPage?: number
  scope?: string
}

export type CanonicalPaginationResult = Response | { size: number; page: number }

export function ensureCanonicalPagination(
  request: Request,
  { defaultSize = 100, defaultPage = 1, scope = '' }: CanonicalDefaults = {}
): CanonicalPaginationResult {
  const url = new URL(request.url)
  const prefix = scope ? `${scope}:` : ''

  const rawSize = Number(
    url.searchParams.get(`${prefix}size`) || url.searchParams.get('size') || String(defaultSize)
  )
  const rawPage = Number(
    url.searchParams.get(`${prefix}page`) || url.searchParams.get('page') || String(defaultPage)
  )

  const size = clampPageSize(rawSize)
  const page = sanitizePage(rawPage)

  if (String(size) !== String(rawSize) || String(page) !== String(rawPage)) {
    url.searchParams.set(`${prefix}size`, String(size))
    url.searchParams.set(`${prefix}page`, String(page))
    return Response.redirect(url.toString(), 302)
  }

  return { size, page }
}
