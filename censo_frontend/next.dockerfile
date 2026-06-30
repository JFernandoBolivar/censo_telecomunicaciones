FROM node:26-alpine AS base
RUN npm install -g pnpm@10.3.0
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm i --no-frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml tsconfig.json next.config.ts postcss.config.mjs eslint.config.mjs components.json auth.config.ts auth.ts proxy.ts ./
COPY app/ app/
COPY lib/ lib/
COPY modules/ modules/
COPY shared/ shared/
COPY types/ types/
COPY public/ public/
RUN pnpm build
RUN pnpm prune --prod

FROM base AS runner
ENV PORT=3000
ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["pnpm", "start"]
