# Build Stage
FROM node:18.20-alpine AS build

WORKDIR /app
COPY package*.json /app/

# Install Angular CLI globally
RUN npm install -g @angular/cli

# Install dependencies
RUN npm install --legacy-peer-deps && npm cache clean --force

# Copy the rest of the application code
COPY ./ /app/

# Run the build using Angular CLI
RUN ng build --output-path=dist/gull

# Production Stage
FROM nginx:1.21-alpine as production-stage

# Copy the built files from the previous stage into the NGINX server
COPY --from=build /app/dist/gull /usr/share/nginx/html

# Copy the Nginx configuration (if needed)
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80 for the NGINX server
EXPOSE 80

# Start NGINX in the foreground
CMD ["nginx", "-g", "daemon off;"]
