# --- STAGE 1: Install dependencies ---
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package management files
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN \
  if [ -f "package-lock.json" ]; then npm ci; \
  elif [ -f "yarn.lock" ]; then yarn --frozen-lockfile; \
  elif [ -f "pnpm-lock.yaml" ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# --- STAGE 2: Build the application ---
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js requires environment variables starting with NEXT_PUBLIC_ 
# to be present at BUILD TIME so they can be baked into the client-side JS.
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_FRONTEND_URL

ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_FRONTEND_URL=$NEXT_PUBLIC_FRONTEND_URL

# Disable telemetry during the build if desired
ENV NEXT_TELEMETRY_DISABLED=1

RUN \
  if [ -f "package-lock.json" ]; then npm run build; \
  elif [ -f "yarn.lock" ]; then yarn build; \
  elif [ -f "pnpm-lock.yaml" ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# --- STAGE 3: Production runner ---
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security purposes
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Leverage Next.js standalone output (reduces image size drastically)
# Note: Ensure you have "output: 'standalone'" in your next.config.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]