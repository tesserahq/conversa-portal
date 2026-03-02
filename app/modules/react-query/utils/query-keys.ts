/**
 * Query Keys Factory
 * Centralized query keys for React Query
 *
 * Benefits:
 * - Type-safe query keys
 * - Easy cache invalidation
 * - Prevents key conflicts
 * - Hierarchical structure for granular invalidation
 *
 * Example usage:
 * export const queryKeys = {
 *   users: {
 *     all: ['users'] as const,
 *     list: (filters?: Record<string, unknown>) =>
 *       [...queryKeys.users.all, 'list', filters] as const,
 *     detail: (id: string) =>
 *       [...queryKeys.users.all, 'detail', id] as const,
 *   },
 *   posts: {
 *     all: ['posts'] as const,
 *     list: (filters?: Record<string, unknown>) =>
 *       [...queryKeys.posts.all, 'list', filters] as const,
 *     detail: (id: string) =>
 *       [...queryKeys.posts.all, 'detail', id] as const,
 *   },
 * } as const;
 */

export const queryKeys = {
  // Add your query keys here when needed
} as const
