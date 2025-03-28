FROM nginx:stable-alpine

# Remove the default Nginx HTML
RUN rm -rf /usr/share/nginx/html/*

# Copy the production build – contents of 'dist' only
COPY dist/ /usr/share/nginx/html/

# Copy your custom HTTPS-only (or redirection) nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 443 (and 80 if you want HTTP open/redirect)
EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
