import { QueryClient } from '@tanstack/react-query'

/**
 * React Query Client Configuration
 * Centralized configuration for all queries and mutations
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Time before data is considered stale (5 minutes)
      staleTime: 1000 * 60 * 5,

      // Time before inactive queries are garbage collected (30 minutes)
      gcTime: 1000 * 60 * 30,

      // Refetch configuration
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnReconnect: true, // Refetch when reconnecting
      refetchOnMount: true, // Refetch on component mount

      // Retry configuration
      retry: 1, // Retry failed queries once
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Don't retry mutations by default
      retry: false,
    },
  },
})
