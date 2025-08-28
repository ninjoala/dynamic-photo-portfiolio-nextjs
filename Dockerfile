# Use the official Node.js image as the base image
FROM node:18-alpine

# Accept build arguments for S3 credentials
ARG WASABI_REGION
ARG WASABI_ENDPOINT
ARG WASABI_BUCKET_NAME
ARG WASABI_ACCESS_KEY_ID
ARG WASABI_SECRET_ACCESS_KEY

# Set them as environment variables for the build process
ENV WASABI_REGION=$WASABI_REGION
ENV WASABI_ENDPOINT=$WASABI_ENDPOINT
ENV WASABI_BUCKET_NAME=$WASABI_BUCKET_NAME
ENV WASABI_ACCESS_KEY_ID=$WASABI_ACCESS_KEY_ID
ENV WASABI_SECRET_ACCESS_KEY=$WASABI_SECRET_ACCESS_KEY

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if it exists)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application with image generation
# Requires S3 environment variables to be available at build time
RUN npm run build
   
# Expose the port that the Next.js app will run on
EXPOSE 3000

# Start the Next.js production server
CMD ["npm", "start"]