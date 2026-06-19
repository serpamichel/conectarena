FROM node:20-alpine AS build
WORKDIR /app

COPY figma/package*.json ./figma/
WORKDIR /app/figma
RUN npm ci

COPY figma/ .
RUN npm run build

FROM nginx:stable-alpine

# Copy custom nginx configuration
COPY frontend/figma/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application
COPY --from=build /app/figma/dist /usr/share/nginx/html

# Create non-root user for nginx
RUN mkdir -p /var/cache/nginx && \
    chown -R nginx:nginx /var/cache/nginx /usr/share/nginx/html /etc/nginx/conf.d

USER nginx

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD wget -q -O /dev/null http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]