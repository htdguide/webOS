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

# Expose HTTP and HTTPS ports (metadata only)
EXPOSE 80 443

# Inline entrypoint:
# If both SSL_PRIVATE_KEY and SSL_CERT_CHAIN are provided, write them to file.
# Otherwise, disable HTTPS by removing SSL-related directives from nginx config.
ENTRYPOINT ["sh", "-c", "\
if [ -n \"$SSL_PRIVATE_KEY\" ] && [ -n \"$SSL_CERT_CHAIN\" ]; then \
  echo \"$SSL_PRIVATE_KEY\" > /etc/ssl/private/ssl.key && \
  echo \"$SSL_CERT_CHAIN\" > /etc/ssl/certs/ssl.crt; \
else \
  echo 'No SSL certificates provided. Disabling SSL and using HTTP only.'; \
  sed -iE '/^[[:space:]]*listen[[:space:]]+443[[:space:]]+ssl;/d' /etc/nginx/conf.d/default.conf; \
  sed -iE '/^[[:space:]]*ssl_certificate[[:space:]]+/d' /etc/nginx/conf.d/default.conf; \
  sed -iE '/^[[:space:]]*ssl_certificate_key[[:space:]]+/d' /etc/nginx/conf.d/default.conf; \
fi; \
exec nginx -g \"daemon off;\""]
