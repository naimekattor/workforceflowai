FROM node:20-slim AS builder

WORKDIR /app

ARG NEXT_PUBLIC_BASE_URL=https://api.revboostai.net/api
ARG NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}
ENV NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}

COPY package*.json ./
RUN npm ci

COPY . .
RUN test -n "$NEXT_PUBLIC_BASE_URL"
RUN npm run build

FROM node:20-slim AS runner

WORKDIR /app

ARG NEXT_PUBLIC_BASE_URL=https://api.revboostai.net/api
ARG NEXT_PUBLIC_WS_URL
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}
ENV NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000

CMD ["node", "server.js"]
