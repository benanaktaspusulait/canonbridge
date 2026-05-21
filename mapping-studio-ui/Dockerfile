# ============================================
# Stage 1: Build the Angular application
# ============================================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (all deps needed for the build step)
RUN npm ci && \
    npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# ============================================
# Stage 2: Serve with Nginx
# ============================================
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY docker-entrypoint.d/10-canonbridge-env.sh /docker-entrypoint.d/10-canonbridge-env.sh
RUN chmod +x /docker-entrypoint.d/10-canonbridge-env.sh

# Copy built application from builder stage
COPY --from=builder /app/dist/mapping-studio-ui/browser /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:80/health || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
