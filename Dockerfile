# Dockerfile

FROM nginx:stable-alpine

# Remove any default files that come with nginx
RUN rm -rf /usr/share/nginx/html/*

# Copy the already-built 'dist' folder from the GitHub Actions environment
COPY dist /usr/share/nginx/html/

# Copy a custom Nginx config with SSL directives
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose ports (metadata only)
EXPOSE 80 443

# Run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
