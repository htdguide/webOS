FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of the application files and build the Vite app
COPY . .

# Expose HTTP and HTTPS ports
EXPOSE 80 443

# Inject SSL certificates from environment variables and start the Vite dev server
CMD ["sh", "-c", "echo \"$VITE_SSL_CERT_CHAIN\" > /etc/ssl/certs/fullchain.pem && \
    echo \"$VITE_SSL_PRIVATE_KEY\" > /etc/ssl/private/ssl_private.key && \
    sudo npm run dev"]
