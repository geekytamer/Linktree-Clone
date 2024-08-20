# Use the official Node.js image to build the React application
FROM node:18 AS build

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm install

# Copy the rest of the frontend code
COPY frontend/ .

# Build the React application
RUN npm run build

# Use a lightweight web server to serve the React application
FROM nginx:alpine

# Copy the built React application from the build stage
COPY --from=build /usr/src/app/build /usr/share/nginx/html

# Expose the port the React app will be served on
EXPOSE 80

# Command to run the web server
CMD ["nginx", "-g", "daemon off;"]