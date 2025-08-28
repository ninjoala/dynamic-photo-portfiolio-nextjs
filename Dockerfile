# Use the official Node.js image as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if it exists)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Use Docker-specific build command that skips image generation
# The images.json file will be copied from local build
RUN npm run build:docker
   
# Expose the port that the Next.js app will run on
EXPOSE 3000

# Start the Next.js production server
CMD ["npm", "start"]