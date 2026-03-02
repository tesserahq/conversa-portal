/* eslint-disable @typescript-eslint/no-explicit-any */
import { CurlGenerator } from 'curl-generator'

export type NodeENVType = 'test' | 'development' | 'staging' | 'production'

// Custom error class for token expiration
export class TokenExpiredError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TokenExpiredError'
  }
}

// Custom error class for unauthorized access
export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export type ApiQueryParams = Record<string, string | number | boolean | undefined>

export type ApiOptions = RequestInit & {
  params?: ApiQueryParams
  pagination?: { page?: number; size?: number }
}

export const fetchApi = async (
  endpoint: string,
  token: string,
  node_env: NodeENVType,
  options: ApiOptions = {}
) => {
  const headers: any = { 'Content-Type': 'application/json' }

  if (token && token.trim() !== '') {
    headers.Authorization = `Bearer ${token}`
  }

  const { params, pagination, ...restOptions } = options

  let url = endpoint

  // Append query params and optional pagination
  if (params || pagination) {
    const urlObj = new URL(endpoint, 'http://dummy-base')
    // If endpoint is absolute, base won't be used. If relative, we strip it later.

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined) return
        urlObj.searchParams.set(key, String(value))
      })
    }

    if (pagination) {
      if (pagination.page !== undefined) {
        urlObj.searchParams.set('page', String(pagination.page))
      }
      if (pagination.size !== undefined) {
        urlObj.searchParams.set('size', String(pagination.size))
      }
    }

    // Reconstruct preserving relative/absolute form
    const search = urlObj.search ? urlObj.search : ''
    const pathname = endpoint.startsWith('http') ? urlObj.toString() : `${urlObj.pathname}${search}`
    url = endpoint.startsWith('http') ? urlObj.toString() : pathname
  }

  const config = {
    ...restOptions,
    headers: {
      ...headers,
      ...restOptions.headers,
    },
  }

  if (node_env === 'development') {
    const params: any = {
      url,
      method: options.method || 'GET',
      ...config,
    }

    const curlSnippet = CurlGenerator(params)

    console.log(curlSnippet)
  }

  const response = await fetch(`${url}`, config)

  // for anticipation error json.parse if response status is 204
  if (response.status === 204) {
    return { message: response.statusText }
  }

  const json = await response.json()

  if (response.status >= 400) {
    // Handle token expiration (401) and unauthorized access (403)
    if (response.status === 401) {
      throw new TokenExpiredError(
        JSON.stringify({
          status: response.status,
          error: json?.detail ? json.detail : json?.detail?.[0]?.msg || 'Token expired or invalid',
        })
      )
    }

    if (response.status === 403) {
      throw new UnauthorizedError(
        JSON.stringify({
          status: response.status,
          error: json?.detail ? json.detail : json?.detail?.[0]?.msg || 'Unauthorized access',
        })
      )
    }

    throw new Error(
      JSON.stringify({
        status: response.status,
        error: json?.detail
          ? json.detail
            ? json.detail
            : json?.detail[0]?.msg
          : response.statusText,
      })
    )
  }

  return json
}
