# Step 1: Build the React App
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Install dependencies based on package.json
COPY package.json ./
RUN npm install

# Copy all other source code to work directory
COPY . .

# Build the app to the /app/build folder
RUN npm run build


# Step 2: Serve the App using Nginx
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy the build output from the build stage to Nginx directory
COPY --from=build /app/build /usr/share/nginx/html

# Hugging Face Spaces runs on port 7860
EXPOSE 7860

# Custom Nginx configuration for port 7860 and React Router support
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
