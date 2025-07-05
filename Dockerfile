FROM oven/bun:alpine AS base

FROM base AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY package.json bun.lock .

RUN bun install


FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY . .
RUN bunx prisma generate

RUN bun run build


FROM base AS runner
WORKDIR /app

COPY --from=builder /app/package.json ./package.json
RUN bun install --production --frozen-lockfile

COPY --from=builder /app/dist ./dist


EXPOSE 3000

CMD ["bun", "--bun", "dist/main.js"]