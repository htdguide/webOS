# Use the official Nginx image
FROM nginx:stable-alpine

# Remove default HTML
RUN rm -rf /usr/share/nginx/html/*

# Copy your production build
COPY dist/ /usr/share/nginx/html/

# Copy both HTTP- and HTTPS-ready nginx configs
COPY nginx.http.conf /etc/nginx/conf.d/default-http.conf
COPY nginx.ssl.conf  /etc/nginx/conf.d/default-ssl.conf

# Copy the entrypoint script that picks the right config
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose both ports (so Docker can map whichever one runs)
EXPOSE 80
EXPOSE 443

# Entrypoint will choose config, then run nginx
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
