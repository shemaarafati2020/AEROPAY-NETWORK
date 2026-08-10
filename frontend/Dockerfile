# Stage 1: Build the Expo Web static bundle
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code and config files
COPY . .

# Build production web bundle using Expo export
ENV NODE_ENV=production
RUN npx expo export --platform web

# Stage 2: Serve production bundle with Nginx
FROM nginx:alpine-slim

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
