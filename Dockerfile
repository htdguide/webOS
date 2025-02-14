FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of the application files and build the React app
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy the build folder to Nginx's default directory
COPY --from=build /app/build /usr/share/nginx/html

# Copy a custom Nginx configuration (if needed)
COPY nginx.conf /etc/nginx/nginx.conf

# Create directories for SSL certificates
RUN mkdir -p /etc/ssl/certs /etc/ssl/private

# Expose HTTP and HTTPS ports
EXPOSE 80 443

# Inject SSL certificates from environment variables and start Nginx
CMD ["sh", "-c", "echo \"$SSL_CERT_CHAIN\" > /etc/ssl/certs/fullchain.pem && \
    echo \"$SSL_PRIVATE_KEY\" > /etc/ssl/private/ssl_private.key && \
    nginx -g 'daemon off;'"]
