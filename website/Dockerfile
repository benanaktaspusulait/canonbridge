# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_SITE_URL=https://canonbridge.io
ARG NEXT_PUBLIC_LEAD_CAPTURE_ENABLED=false
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY=
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_LEAD_CAPTURE_ENABLED=$NEXT_PUBLIC_LEAD_CAPTURE_ENABLED
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY

COPY package*.json ./
RUN npm install --no-audit --no-fund

COPY . .
RUN npm run build

# Stage 2: Serve the Next standalone app
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
