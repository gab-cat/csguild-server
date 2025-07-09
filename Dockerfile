FROM oven/bun:alpine AS base

FROM base AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY package.json bun.lock ./

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

COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/generated ./generated
COPY --from=builder --chown=nestjs:nodejs /app/public ./public
# Copy the templates folder
COPY --from=builder --chown=nestjs:nodejs /app/src/common/email/templates ./dist/templates


EXPOSE 3001

CMD ["bun", "--bun", "dist/main.js"]