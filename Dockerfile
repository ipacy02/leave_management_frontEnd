 # Frontend Dockerfile
FROM node:20-alpine as build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN echo "Starting npm install..." && \
    npm install && \
    echo "npm install completed"

# Copy all frontend files
COPY . .

# List files for debugging
RUN ls -la

# Set environment variables
ENV VITE_API_URL=http://localhost:3000/api/v1
ENV VITE_MICROSOFT_CLIENT_ID=f7cef167-71bd-42f9-80b0-65ce44c8a2f5
ENV VITE_MICROSOFT_TENANT_ID=1648228f-b5d4-4e62-9ce5-431fb3cc0474

# Build the app
RUN echo "Starting npm build..." && \
    npm run build && \
    echo "Build completed" && \
    ls -la dist

# Production stage
FROM nginx:alpine

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Verify the files were copied
RUN echo "Files in nginx html directory:" && \
    ls -la /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]