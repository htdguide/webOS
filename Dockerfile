# Stage 1: Set up the development environment
FROM node:18-alpine as development

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose port 5173 (Vite default port)
EXPOSE 80

# Run the development server
CMD ["PORT=80","npm", "start"]
