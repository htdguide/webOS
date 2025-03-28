FROM nginx:stable-alpine

# Remove the default Nginx HTML
RUN rm -rf /usr/share/nginx/html/*

# Copy the production build – contents of dist, not the dist folder name itself
COPY dist/ /usr/share/nginx/html/

# Copy your custom HTTPS-only nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]
