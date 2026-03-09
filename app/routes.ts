import { type RouteConfig, index, layout, route } from '@react-router/dev/routes'

export default [
  // Theme
  route('/resources/update-theme', 'routes/resources/update-theme.ts'),

  // Home Route
  route('/', 'routes/index.tsx', { id: 'home' }),

  route('setup', 'routes/setup/index.tsx'),

  // Private Routes
  layout('layouts/private.layouts.tsx', [
    route('/credentials', 'routes/main/credentials/layout.tsx', [
      index('routes/main/credentials/index.tsx'),
      route('new', 'routes/main/credentials/new.tsx'),
      route(':credentialID/edit', 'routes/main/credentials/edit.tsx'),
      route(':credentialID', 'routes/main/credentials/details/layout.tsx', [
        index('routes/main/credentials/details/index.tsx'),
        route('overview', 'routes/main/credentials/details/overview.tsx'),
      ]),
    ]),
    route('/context-sources', 'routes/main/context-sources/layout.tsx', [
      index('routes/main/context-sources/index.tsx'),
      route('new', 'routes/main/context-sources/new.tsx'),
      route(':contextSourceID/edit', 'routes/main/context-sources/edit.tsx'),
      route(':contextSourceID', 'routes/main/context-sources/details/layout.tsx', [
        index('routes/main/context-sources/details/index.tsx'),
        route('overview', 'routes/main/context-sources/details/overview.tsx'),
      ]),
    ]),
    route('/mcp-servers', 'routes/main/mcp-servers/layout.tsx', [
      index('routes/main/mcp-servers/index.tsx'),
      route('new', 'routes/main/mcp-servers/new.tsx'),
      route(':mcpServerID/edit', 'routes/main/mcp-servers/edit.tsx'),
      route(':mcpServerID', 'routes/main/mcp-servers/details/layout.tsx', [
        index('routes/main/mcp-servers/details/index.tsx'),
        route('overview', 'routes/main/mcp-servers/details/overview.tsx'),
      ]),
    ]),
  ]),

  // Access Denied
  route('access-denies', 'routes/access-denies.tsx'),

  // Logout Route
  route('logout', 'routes/logout.tsx', { id: 'logout' }),

  // Catch-all route for 404 errors - must be last
  route('*', 'routes/not-found.tsx'),
] as RouteConfig
