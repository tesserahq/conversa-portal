import { MembershipType } from '@/resources/queries/memberships/membership.type'
import { RoleType } from '@/resources/queries/roles/role.type'
import { UserType } from '@/resources/queries/users/user.type'
import { BreadcrumbItemData } from 'tessera-ui/layouts'

/**
 * Union type of all possible resource data types
 * Add more resource types here as you implement them
 */
export type BreadcrumbResourceData = RoleType | UserType | MembershipType

/**
 * Configuration for breadcrumb generation
 */
export interface GeneratingBreadcrumbConfig {
  pathname: string
  params: Record<string, string | undefined>
  resourceData?: Record<string, BreadcrumbResourceData | undefined>
}

/**
 * Generates breadcrumb items from pathname and resource data
 *
 * @param config - Breadcrumb configuration including pathname, params, and resource data
 * @returns Array of breadcrumb items
 *
 * @example
 * ```ts
 * const breadcrumbs = generateBreadcrumbs({
 *   pathname: '/accounts/123/family-members/456',
 *   params: { accountID: '123', personID: '456' },
 *   resourceData: {
 *     accountID: account,  // AccountType with 'name'
 *     personID: person,    // PersonType with 'first_name' and 'last_name'
 *   }
 * })
 * ```
 */
export function generateBreadcrumbs({
  pathname,
  params,
  resourceData,
}: {
  pathname: string
  params: Record<string, string | undefined>
  resourceData: Record<
    string,
    {
      data?: BreadcrumbResourceData
      isLoading: boolean
      error?: Error | null
    }
  >
}): BreadcrumbItemData[] {
  const parts = pathname.split('/').filter(Boolean)

  return parts.map((part, index) => {
    const matched = Object.entries(params).find(([, value]) => value === part)

    let label = formatPathPart(part)

    if (matched) {
      const [paramKey] = matched
      const resource = resourceData[paramKey]

      if (resource?.isLoading) {
        label = 'Loading…'
      } else if (resource?.error) {
        label = 'Unknown'
      } else {
        label = getResourceName(resource?.data)
      }
    }

    return {
      label,
      link: '/' + parts.slice(0, index + 1).join('/'),
    }
  })
}

/**
 * Formats a path part by replacing hyphens with spaces and capitalizing
 *
 * @param part - Path part to format
 * @returns Formatted string
 */
export function formatPathPart(part: string): string {
  return part
    .replace(/-/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Gets the resource name from resource data
 * Handles different naming conventions:
 * - AccountType: uses 'name'
 * - PersonType: combines 'first_name' and 'last_name'
 * - Add more resource types as needed
 *
 * @param resource - Resource data object
 * @returns Resource name or empty string
 */
export function getResourceName(resource: BreadcrumbResourceData | undefined): string {
  if (!resource) return ''

  // User has 'first_name' and 'last_name' properties
  if ('first_name' in resource && 'last_name' in resource) {
    return `${resource.first_name} ${resource.last_name}`.trim()
  }

  // Role
  if ('name' in resource && resource.name) {
    return resource.name.trim()
  }

  // Membership
  if ('role' in resource && resource.role) {
    return resource.role.name.trim()
  }

  // Fallback for other types
  return ''
}
