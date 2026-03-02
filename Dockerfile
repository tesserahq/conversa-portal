# syntax = docker/dockerfile:1

# Use the latest Bun version
FROM oven/bun:1.3 AS base

# Remix app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Throw-away build stage to reduce size of final image
FROM base AS build

# Install dependencies (skip lifecycle scripts in container builds)
COPY --link package.json bun.lock ./
RUN bun install --frozen-lockfile --ignore-scripts

# Copy application code
COPY --link . .

# Build application
RUN bun run build

# Remove development dependencies (skip lifecycle scripts in container builds)
RUN bun install --production --frozen-lockfile --ignore-scripts

# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "bun", "run", "start" ]