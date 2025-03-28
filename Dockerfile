# Dockerfile

# Stage 1: Build the Vite app
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of the application files
COPY . .

# Build the Vite project (ensure your package.json "build" script outputs to the "dist" folder)
RUN npm run build

# Stage 2: Production container with nginx
FROM nginx:stable-alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built static files to nginx's html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy entrypoint script and set executable permission
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose HTTP and HTTPS ports (metadata only)
EXPOSE 80 443

ENTRYPOINT ["/entrypoint.sh"]
